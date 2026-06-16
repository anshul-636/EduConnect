/**
 * internal.routes.js
 *
 * Internal-only routes consumed by the Python AI service (localhost only).
 * These endpoints are NOT user-facing and must NOT be exposed publicly.
 * Mount BEFORE the main API under /internal (not /api/v1).
 *
 * Wire up in index.js:
 *   app.use('/internal', require('./routes/internal.routes'));
 *
 * Secure with an IP check middleware — only allow 127.0.0.1 / ::1.
 */

const { Router } = require('express');
const prisma = require('../utils/prisma');

const router = Router();

// Block any non-localhost caller
const localhostOnly = (req, res, next) => {
  const ip = req.ip || req.socket?.remoteAddress || '';
  const isLocal =
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('172.') || // Docker bridge
    ip.startsWith('10.');    // Private networks (docker compose)
  if (!isLocal) {
    return res.status(403).json({ error: 'Forbidden: internal route' });
  }
  next();
};

router.use(localhostOnly);

// ─── POST /internal/sessions/load ─────────────────────────────────────────────
router.post('/sessions/load', async (req, res) => {
  const { session_id, bot_type = 'RAG', student_id, resource_id } = req.body;
  if (!session_id) return res.json({ messages: [] });

  try {
    let session = await prisma.chatSession.findFirst({
      where: { id: session_id },
    });

    if (!session && student_id) {
      // Auto-create session if student_id is known
      session = await prisma.chatSession.upsert({
        where: { id: session_id },
        create: {
          id: session_id,
          botType: bot_type,
          messages: [],
          studentId: student_id,
          resourceId: resource_id || null,
        },
        update: {},
      });
    }

    res.json({ messages: session?.messages || [] });
  } catch (err) {
    console.error('[Internal/load]', err.message);
    res.json({ messages: [] });
  }
});

// ─── POST /internal/sessions/save ─────────────────────────────────────────────
router.post('/sessions/save', async (req, res) => {
  const { session_id, messages } = req.body;
  if (!session_id || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'session_id and messages required' });
  }

  try {
    await prisma.chatSession.updateMany({
      where: { id: session_id },
      data: { messages },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[Internal/save]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /internal/sessions/clear ────────────────────────────────────────────
router.post('/sessions/clear', async (req, res) => {
  const { session_id } = req.body;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  try {
    await prisma.chatSession.updateMany({
      where: { id: session_id },
      data: { messages: [] },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[Internal/clear]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
