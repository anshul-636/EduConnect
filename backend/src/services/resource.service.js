/**
 * resource.service.js
 *
 * FIXES:
 *  • getById() — auto-increments viewCount on every fetch
 *  • upvote()  — per-user idempotent (uses ResourceUpvote join table)
 *  • getAll()  — supports pagination (?page=1&limit=20)
 */

const prisma = require('../utils/prisma');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ResourceService {
  async create(data, file, userId) {
    // In production, upload buffer to Cloudinary and get back a CDN URL.
    // In development, file is on local disk — build a URL from BACKEND_URL.
    let fileUrl = data.fileUrl || null;
    if (file) {
      if (process.env.NODE_ENV === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
        const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
        fileUrl = await uploadToCloudinary(file.buffer, file.originalname);
      } else {
        fileUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${file.filename}`;
      }
    }

    const resource = await prisma.resource.create({
      data: {
        title: data.title,
        description: data.description || null,
        type: data.type || 'PDF',
        fileUrl,
        subject: data.subject || null,
        topic: data.topic || null,
        difficulty: data.difficulty || 'BEGINNER',
        uploadedBy: userId,
      },
      include: { uploader: { select: { id: true, name: true, role: true } } },
    });

    // Auto-embed PDF into ChromaDB for AI RAG search
    if (file && (data.type === 'PDF' || file.originalname?.endsWith('.pdf'))) {
      try {
        const FormData = require('form-data');
        const form = new FormData();

        if (fileUrl && fileUrl.startsWith('http')) {
          // Cloudinary / remote URL — stream directly without touching disk
          const response = await axios.get(fileUrl, { responseType: 'stream' });
          form.append('file', response.data, { filename: file.originalname || file.filename });
        } else {
          const filePath = path.join(__dirname, '../../uploads', file.filename);
          form.append('file', fs.createReadStream(filePath), {
            filename: file.originalname || file.filename,
          });
        }

        form.append('resource_id', resource.id);
        form.append('title', resource.title);

        const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        await axios.post(`${aiUrl}/api/v1/embed/pdf`, form, {
          headers: form.getHeaders(),
          timeout: 30000,
        });
        console.log(`✅ Auto-embedded "${resource.title}" into ChromaDB`);
      } catch (e) {
        console.error(`⚠️ Auto-embed failed for "${resource.title}":`, e.message);
      }
    }

    return resource;
  }

  async getAll(filters = {}) {
    const where = {};
    if (filters.subject)
      where.subject = { contains: filters.subject, mode: 'insensitive' };
    if (filters.type) where.type = filters.type;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.search)
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { topic: { contains: filters.search, mode: 'insensitive' } },
      ];

    // Pagination
    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          uploader: { select: { id: true, name: true, role: true } },
          school: { select: { id: true, name: true } },
          _count: { select: { upvoteRecords: true } },
        },
      }),
      prisma.resource.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * FIXED: auto-increments viewCount on every call.
   * Uses update() so it's atomic and returns the updated row.
   */
  async getById(id) {
    const resource = await prisma.resource.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      include: {
        uploader: { select: { id: true, name: true, role: true } },
        school: { select: { id: true, name: true } },
        _count: { select: { upvoteRecords: true } },
      },
    });
    // Prisma throws P2025 if not found — catch upstream
    return resource;
  }

  /**
   * FIXED: Per-user upvote with idempotency.
   * Returns { upvoted: true/false, upvotes: N }
   */
  async upvote(id, userId) {
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      const err = new Error('Resource not found.');
      err.statusCode = 404;
      throw err;
    }

    // Check if user already upvoted
    const existing = await prisma.resourceUpvote.findUnique({
      where: { userId_resourceId: { userId, resourceId: id } },
    });

    if (existing) {
      // Toggle off — remove upvote
      await prisma.$transaction([
        prisma.resourceUpvote.delete({ where: { id: existing.id } }),
        prisma.resource.update({
          where: { id },
          data: { upvotes: { decrement: 1 } },
        }),
      ]);

      const updated = await prisma.resource.findUnique({
        where: { id },
        include: { uploader: { select: { id: true, name: true, role: true } } },
      });
      return { upvoted: false, upvotes: updated.upvotes, resource: updated };
    } else {
      // Add upvote
      await prisma.$transaction([
        prisma.resourceUpvote.create({ data: { userId, resourceId: id } }),
        prisma.resource.update({
          where: { id },
          data: { upvotes: { increment: 1 } },
        }),
      ]);

      const updated = await prisma.resource.findUnique({
        where: { id },
        include: { uploader: { select: { id: true, name: true, role: true } } },
      });
      return { upvoted: true, upvotes: updated.upvotes, resource: updated };
    }
  }

  /** Check if a user has upvoted a resource */
  async hasUpvoted(id, userId) {
    const existing = await prisma.resourceUpvote.findUnique({
      where: { userId_resourceId: { userId, resourceId: id } },
    });
    return !!existing;
  }

  async delete(id, userId) {
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      const err = new Error('Resource not found.');
      err.statusCode = 404;
      throw err;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (resource.uploadedBy !== userId && user?.role !== 'ADMIN') {
      const err = new Error('You can only delete your own resources.');
      err.statusCode = 403;
      throw err;
    }

    if (resource.fileUrl && resource.fileUrl.includes('/uploads/')) {
      try {
        const filename = resource.fileUrl.split('/uploads/')[1];
        const filePath = path.join(__dirname, '../../uploads', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        console.error('Local file delete error:', e);
      }
    }

    return prisma.resource.delete({ where: { id } });
  }
}

module.exports = new ResourceService();