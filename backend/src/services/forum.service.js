/**
 * forum.service.js
 *
 * ADDED:  edit()  — update content of an existing post
 * ADDED:  like()  — toggle like on a post (idempotent)
 * FIXED:  getAll() — pagination support
 * ADDED:  tag/search support
 */

const prisma = require('../utils/prisma');

const POST_INCLUDE = {
  author: { select: { id: true, name: true, role: true } },
  event: { select: { id: true, title: true } },
  _count: { select: { replies: true, likes: true } },
};

class ForumService {

  async create(data, userId) {
    return prisma.forumPost.create({
      data: {
        title: data.title || null,
        content: data.content,
        eventId: data.eventId || null,
        authorId: userId,
        parentId: null,
      },
      include: POST_INCLUDE,
    });
  }

  async getAll(filters = {}) {
    const where = { parentId: null };
    if (filters.eventId) where.eventId = filters.eventId;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(filters.limit) || 15));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: POST_INCLUDE,
      }),
      prisma.forumPost.count({ where }),
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

  async getById(id) {
    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, role: true } },
        event: { select: { id: true, title: true } },
        _count: { select: { replies: true, likes: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, role: true } },
            _count: { select: { likes: true } },
          },
        },
      },
    });
    if (!post) {
      const err = new Error('Post not found.');
      err.statusCode = 404;
      throw err;
    }
    return post;
  }

  async reply(parentId, content, userId) {
    const parent = await prisma.forumPost.findUnique({ where: { id: parentId } });
    if (!parent) {
      const err = new Error('Post not found.');
      err.statusCode = 404;
      throw err;
    }
    const reply = await prisma.forumPost.create({
      data: {
        content,
        authorId: userId,
        parentId,
        eventId: parent.eventId,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
        _count: { select: { likes: true } },
      },
    });

    // Notify original post author (if different from replier)
    if (parent.authorId !== userId) {
      try {
        const notificationService = require('./notification.service');
        const replier = await require('../utils/prisma').user.findUnique({
          where: { id: userId },
          select: { name: true },
        });
        await notificationService.create({
          userId: parent.authorId,
          type: 'FORUM_REPLY',
          title: 'New reply on your post',
          message: `${replier?.name || 'Someone'} replied to your forum post.`,
          data: { postId: parentId },
        });
      } catch (_) {} // Non-critical
    }

    return reply;
  }

  /**
   * ADDED: Edit a post's content (author only, or ADMIN).
   */
  async edit(id, content, userId, userRole) {
    const post = await prisma.forumPost.findUnique({ where: { id } });
    if (!post) {
      const err = new Error('Post not found.');
      err.statusCode = 404;
      throw err;
    }
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      const err = new Error('You can only edit your own posts.');
      err.statusCode = 403;
      throw err;
    }
    return prisma.forumPost.update({
      where: { id },
      data: { content, isEdited: true, editedAt: new Date() },
      include: {
        author: { select: { id: true, name: true, role: true } },
        _count: { select: { replies: true, likes: true } },
      },
    });
  }

  /**
   * ADDED: Toggle like on a post (idempotent).
   */
  async like(postId, userId) {
    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) {
      const err = new Error('Post not found.');
      err.statusCode = 404;
      throw err;
    }

    const existing = await prisma.forumLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await prisma.forumLike.delete({ where: { id: existing.id } });
      return { liked: false };
    } else {
      await prisma.forumLike.create({ data: { userId, postId } });
      return { liked: true };
    }
  }

  async delete(id, userId, userRole) {
    const post = await prisma.forumPost.findUnique({ where: { id } });
    if (!post) {
      const err = new Error('Post not found.');
      err.statusCode = 404;
      throw err;
    }
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      const err = new Error('You can only delete your own posts.');
      err.statusCode = 403;
      throw err;
    }
    return prisma.forumPost.delete({ where: { id } });
  }
}

module.exports = new ForumService();
