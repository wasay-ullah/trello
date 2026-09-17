import express from "express";
import { Board } from "../models/relation.js";
import isAuthenticated from "../middleware/authenticate.js";

const router = express.Router();

router.get("/", isAuthenticated, async(req, res) => {
  try {
    const boards = await Board.findAll({
      where: { userId: req.session.user.id },
      order: [['updatedAt', 'DESC']],
    });
    return res.json(boards);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const board = await Board.findOne({
      where: { id: req.params.id, userId: req.session.user.id },
      include: [{ association: 'columns', include: [{ association: 'cards' }] }],
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    return res.json(board);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Board title is required' });
    }

    const newBoard = await Board.create({
      title,
      description,
      userId: req.session.user.id,
    });

    return res.status(201).json(newBoard);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const board = await Board.findOne({
      where: { id: req.params.id, userId: req.session.user.id },
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const { title, description } = req.body;
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: 'Board title is required' });
    }

    await board.update({
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description }),
    });

    return res.json(board);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const board = await Board.findOne({
      where: { id: req.params.id, userId: req.session.user.id },
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    await board.destroy();
    return res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


export default router;