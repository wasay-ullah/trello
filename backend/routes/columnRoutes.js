import express from "express";
import { Board, Column } from "../models/relation.js";
import isAuthenticated from "../middleware/authenticate.js";

const router = express.Router();

router.post('/boards/:boardId/columns', isAuthenticated, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Column title is required' });
    }

    const board = await Board.findOne({
      where: { id: boardId, userId: req.session.user.id },
    });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const count = await Column.count({ where: { boardId } });
    const newColumn = await Column.create({
      title: title.trim(),
      boardId,
      position: count,
    });

    return res.status(201).json(newColumn);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put('/columns/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const column = await Column.findByPk(id, {
      include: [{ model: Board, where: { userId: req.session.user.id } }],
    });

    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    if (title && title.trim()) {
      column.title = title.trim();
      await column.save();
    }

    return res.json(column);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/columns/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const column = await Column.findByPk(id, {
      include: [{ model: Board, where: { userId: req.session.user.id } }],
    });

    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    await column.destroy();
    return res.json({ message: 'Column deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/columns/reorder
router.patch('/columns/reorder', isAuthenticated, async (req, res) => {
  const { columnUpdates } = req.body; // array of { id, position }

  try {
    if (Array.isArray(columnUpdates)) {
      await Promise.all(
        columnUpdates.map((item) =>
          Column.update(
            { position: item.position },
            { where: { id: item.id } }
          )
        )
      );
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;