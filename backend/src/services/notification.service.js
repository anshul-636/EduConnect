/**
 * notification.service.js
 *
 * Centralised notification creation + querying.
 * Used by certificate.service, event auto-transitions, assignments, etc.
 * Also broadcasts over WebSocket if the user is connected.
 */

const prisma = require('../utils/prisma');

class NotificationService {

  /**
   * Create a single notification.
   * Optionally broadcasts over WebSocket.
   */
  async create({ userId, type, title, message, data = null }) {
    const notification = await prisma.notification.create({
      data: { userId, type, title, message, data, isRead: false },
    });

    // Non-blocking WebSocket push (if user is connected)
    try {
      const { broadcastToUser } = require('../utils/websocket');
      broadcastToUser(userId, { event: 'notification', payload: { notification } });
    } catch (_) {
      // WebSocket not available — that's fine
    }

    return notification;
  }

  /**
   * Bulk-create notifications for multiple users at once.
   * Useful for event reminders, announcements, etc.
   */
  async bulkCreate(notifications) {
    const created = await prisma.notification.createMany({
      data: notifications,
      skipDuplicates: false,
    });

    // Broadcast each notification
    try {
      const { broadcastToUser } = require('../utils/websocket');
      notifications.forEach((n) => {
        broadcastToUser(n.userId, { event: 'notification', payload: { notification: n } });
      });
    } catch (_) {}

    return created;
  }

  async getForUser(userId, filters = {}) {
    const where = { userId };
    if (filters.unreadOnly === 'true' || filters.unreadOnly === true) {
      where.isRead = false;
    }

    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(50, parseInt(filters.limit) || 20);
    const skip = (page - 1) * limit;

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      items,
      unreadCount,
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

  async markRead(notificationId, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) {
      const err = new Error('Notification not found.');
      err.statusCode = 404;
      throw err;
    }
    if (notification.userId !== userId) {
      const err = new Error('Access denied.');
      err.statusCode = 403;
      throw err;
    }
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  }

  async delete(notificationId, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) {
      const err = new Error('Notification not found.');
      err.statusCode = 404;
      throw err;
    }
    if (notification.userId !== userId) {
      const err = new Error('Access denied.');
      err.statusCode = 403;
      throw err;
    }
    return prisma.notification.delete({ where: { id: notificationId } });
  }
}

module.exports = new NotificationService();