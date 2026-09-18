import express from "express";
import { Board, Card, Column } from "../models/relation.js";
import isAuthenticated from "../middleware/authenticate.js";

const router = express.Router();

async function getOwnedColumn(columnId, userId) {
  return Column.findOne({
    where: { id: columnId },
    include: [{ model: Board, where: { userId } }],
  });
}

router.post("/columns/:columnId/cards", isAuthenticated, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Card title is required" });
    }

    const column = await getOwnedColumn(req.params.columnId, req.session.user.id);
    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }

    const position = await Card.count({ where: { columnId: column.id } });
    const card = await Card.create({
      title: title.trim(),
      columnId: column.id,
      position,
    });

    return res.status(201).json(card);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/cards/:id", isAuthenticated, async (req, res) => {
  try {
    const card = await Card.findByPk(req.params.id, {
      include: [{ model: Column, include: [{ model: Board, where: { userId: req.session.user.id } }] }],
    });

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const { title, description, dueDate, isCompleted } = req.body;
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: "Card title is required" });
    }

    await card.update({
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description }),
      ...(dueDate !== undefined && { dueDate }),
      ...(isCompleted !== undefined && { isCompleted }),
    });

    return res.json(card);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/cards/:id", isAuthenticated, async (req, res) => {
  try {
    const card = await Card.findByPk(req.params.id, {
      include: [{ model: Column, include: [{ model: Board, where: { userId: req.session.user.id } }] }],
    });

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    await card.destroy();
    return res.json({ message: "Card deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/cards/reorder
router.patch('/cards/reorder',isAuthenticated, async (req, res) => {
  const { cardId, sourceColumnId, targetColumnId, newPosition, columnUpdates } = req.body;

  try {
    // columnUpdates is an array of { id, position, columnId }
    if (Array.isArray(columnUpdates)) {
      await Promise.all(
        columnUpdates.map((item) =>
          Card.update(
            { position: item.position, columnId: item.columnId },
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
