import express from ('express');

import  { Card, Column, Board } from ('../models');

const router = express.Router();

const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// 1. Create a card in a column
router.post('/columns/:columnId/cards', requireAuth, async (req, res) => {
  try {
    const { columnId } = req.params;
    const { title, description, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Card title is required' });
    }

    // Verify ownership through column and board
    const column = await Column.findByPk(columnId, {
      include: [{ model: Board, where: { userId: req.session.userId } }],
    });

    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    const count = await Card.count({ where: { columnId } });

    const newCard = await Card.create({
      title: title.trim(),
      description: description || null,
      dueDate: dueDate || null,
      columnId,
      position: count,
    });

    return res.status(201).json(newCard);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. Update card details (title, description, dueDate, isCompleted)
router.put('/cards/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, isCompleted } = req.body;

    const card = await Card.findByPk(id, {
      include: [
        {
          model: Column,
          include: [{ model: Board, where: { userId: req.session.userId } }],
        },
      ],
    });

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (title !== undefined) card.title = title.trim();
    if (description !== undefined) card.description = description;
    if (dueDate !== undefined) card.dueDate = dueDate || null;
    if (isCompleted !== undefined) card.isCompleted = isCompleted;

    await card.save();
    return res.json(card);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Delete a card
router.delete('/cards/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const card = await Card.findByPk(id, {
      include: [
        {
          model: Column,
          include: [{ model: Board, where: { userId: req.session.userId } }],
        },
      ],
    });

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    await card.destroy();
    return res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;