import express from "express";
import { Board, Column } from "../models/relation.js";
import isAuthenticated from "../middleware/authenticate.js";

const router = express.Router();

// 1. Create a column in a board
router.post('/boards/:boardId/columns', isAuthenticated, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Column title is required' });
    }

    // Verify user owns the board
    const board = await Board.findOne({
      where: { id: boardId, userId: req.session.user.id },
    });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Calculate position (next position at the end)
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

// 2. Rename a column
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

// 3. Delete a column
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

export default router;