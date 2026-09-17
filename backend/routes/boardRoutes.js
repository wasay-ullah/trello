import express from "express";
import { Board } from "../models/relation.js";
import isAuthenticated from "../middleware/authenticate.js";

const router = express.Router();

// In routes/boardRoutes.js (GET /:id)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const board = await Board.findOne({
      where: { id: req.params.id, userId: req.session.userId },
      include: [
        {
          model: Column,
          as: 'columns',
          include: [
            {
              model: Card,
              as: 'cards',
            },
          ],
        },
      ],
      order: [
        [{ model: Column, as: 'columns' }, 'position', 'ASC'],
        [{ model: Column, as: 'columns' }, { model: Card, as: 'cards' }, 'position', 'ASC'],
      ],
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    return res.json(board);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});