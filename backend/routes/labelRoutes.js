import express from "express";
import { Board, Card, Column, label as Label } from "../models/relation.js";
import isAuthenticated from "../middleware/authenticate.js";

const router = express.Router();

async function getOwnedBoard(boardId, userId) {
  return Board.findOne({ where: { id: boardId, userId } });
}

async function getOwnedCard(cardId, userId) {
  return Card.findOne({
    where: { id: cardId },
    include: [{ model: Column, include: [{ model: Board, where: { userId } }] }],
  });
}

router.post('/boards/:boardId/labels', isAuthenticated, async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Label name is required' });
    }

    const board = await getOwnedBoard(req.params.boardId, req.session.user.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const createdLabel = await Label.create({
      name: name.trim(),
      color: color || '#3b82f6',
      boardId: board.id,
    });

    return res.status(201).json(createdLabel);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function updateCardLabel(req, res, action) {
  const card = await getOwnedCard(req.params.cardId, req.session.user.id);
  const foundLabel = await Label.findByPk(req.params.labelId);

  if (!card || !foundLabel || card.Column.boardId !== foundLabel.boardId) {
    return res.status(404).json({ message: 'Card or label not found' });
  }

  await card[action](foundLabel);
  const updatedCard = await Card.findByPk(req.params.cardId, {
    include: [{ model: Label, as: 'labels', through: { attributes: [] } }],
  });
  return res.json(updatedCard);
}

router.post('/cards/:cardId/labels/:labelId', isAuthenticated, async (req, res) => {
  try {
    return await updateCardLabel(req, res, 'addLabel');
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/cards/:cardId/labels/:labelId', isAuthenticated, async (req, res) => {
  try {
    return await updateCardLabel(req, res, 'removeLabel');
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
