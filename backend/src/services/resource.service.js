const prisma = require('../utils/prisma');
const { cloudinary } = require('../utils/cloudinary');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ResourceService {
  async create(data, file, userId) {
    // Generate a URL pointing to the local backend /uploads endpoint
    const fileUrl = file ? `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${file.filename}` : (data.fileUrl || null);

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
        const filePath = path.join(__dirname, '../../uploads', file.filename);
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath), { filename: file.originalname || file.filename });
        form.append('resource_id', resource.id);
        form.append('title', resource.title);

        const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
        await axios.post(`${aiUrl}/api/v1/embed/pdf`, form, {
          headers: form.getHeaders(),
          timeout: 30000,
        });
        console.log(`✅ Auto-embedded resource "${resource.title}" into ChromaDB`);
      } catch (e) {
        console.error(`⚠️ Auto-embed failed for "${resource.title}":`, e.message);
      }
    }

    return resource;
  }

  async getAll(filters = {}) {
    const where = {};
    if (filters.subject) where.subject = { contains: filters.subject, mode: 'insensitive' };
    if (filters.type) where.type = filters.type;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.search) where.title = { contains: filters.search, mode: 'insensitive' };
    return prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: { select: { id: true, name: true, role: true } },
        school: { select: { id: true, name: true } },
      },
    });
  }

  async getById(id) {
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        uploader: { select: { id: true, name: true, role: true } },
        school: { select: { id: true, name: true } },
      },
    });
    if (!resource) { const err = new Error('Resource not found.'); err.statusCode = 404; throw err; }
    return resource;
  }

  async incrementViewCount(id) {
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) { const err = new Error('Resource not found.'); err.statusCode = 404; throw err; }
    return prisma.resource.update({ where: { id }, data: { viewCount: { increment: 1 } } });
  }


  async delete(id, userId) {
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) { const err = new Error('Resource not found.'); err.statusCode = 404; throw err; }
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (resource.uploadedBy !== userId && user?.role !== 'ADMIN') {
      const err = new Error('You can only delete your own resources.'); err.statusCode = 403; throw err;
    }
    if (resource.fileUrl && resource.fileUrl.includes('/uploads/')) {
      try {
        const fs = require('fs');
        const path = require('path');
        const filename = resource.fileUrl.split('/uploads/')[1];
        const filePath = path.join(__dirname, '../../uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) { console.error('Local file delete error:', e); }
    }
    return prisma.resource.delete({ where: { id } });
  }

  async upvote(id) {
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) { const err = new Error('Resource not found.'); err.statusCode = 404; throw err; }
    return prisma.resource.update({ 
      where: { id }, 
      data: { upvotes: { increment: 1 } },
      include: {
        uploader: { select: { id: true, name: true, role: true } },
        school: { select: { id: true, name: true } },
      },
    });
  }

}

module.exports = new ResourceService();
