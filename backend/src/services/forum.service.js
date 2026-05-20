const prisma = require('../utils/prisma');

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
      include: {
        author: { select: { id: true, name: true, role: true } },
        _count: { select: { replies: true } },
      },
    });
  }

  async getAll(filters = {}) {
    const where = { parentId: null };
    if (filters.eventId) where.eventId = filters.eventId;
    return prisma.forumPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, role: true } },
        event: { select: { id: true, title: true } },
        _count: { select: { replies: true } },
      },
    });
  }

  async getById(id) {
    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, role: true } },
        event: { select: { id: true, title: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true, role: true } } },
        },
      },
    });
    if (!post) { const err = new Error('Post not found.'); err.statusCode = 404; throw err; }
    return post;
  }

  async reply(parentId, content, userId) {
    const parent = await prisma.forumPost.findUnique({ where: { id: parentId } });
    if (!parent) { const err = new Error('Post not found.'); err.statusCode = 404; throw err; }
    return prisma.forumPost.create({
      data: {
        content,
        authorId: userId,
        parentId,
        eventId: parent.eventId,
      },
      include: { author: { select: { id: true, name: true, role: true } } },
    });
  }

  async delete(id, userId, userRole) {
    const post = await prisma.forumPost.findUnique({ where: { id } });
    if (!post) { const err = new Error('Post not found.'); err.statusCode = 404; throw err; }
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      const err = new Error('You can only delete your own posts.'); err.statusCode = 403; throw err;
    }
    return prisma.forumPost.delete({ where: { id } });
  }
}

module.exports = new ForumService();
