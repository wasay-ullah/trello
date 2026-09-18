import { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

const API_BASE = 'http://localhost:3000/api';

export default function Column({
  column,
  index,
  onColumnUpdated,
  onColumnDeleted,
  onCardAdded,
  onSelectCard,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleSaveTitle = async () => {
    setIsEditing(false);
    if (!title.trim() || title === column.title) {
      setTitle(column.title);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/columns/${column.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: title.trim() }),
      });
      if (res.ok) onColumnUpdated(await res.json());
      else setTitle(column.title);
    } catch (err) {
      console.error(err);
      setTitle(column.title);
    }
  };

  const handleDelete = async () => {
    const hasCards = column.cards?.length > 0;
    const msg = hasCards
      ? `This column has ${column.cards.length} cards. Delete anyway?`
      : `Delete "${column.title}"?`;
    if (!window.confirm(msg)) return;

    try {
      const res = await fetch(`${API_BASE}/columns/${column.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) onColumnDeleted(column.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/columns/${column.id}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newCardTitle.trim() }),
      });
      if (res.ok) {
        onCardAdded(column.id, await res.json());
        setNewCardTitle('');
        setIsAddingCard(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Draggable draggableId={`col-${column.id}`} index={index}>
      {(columnProvided) => (
        <div
          ref={columnProvided.innerRef}
          {...columnProvided.draggableProps}
          className="column"
        >
          <div {...columnProvided.dragHandleProps} className="column-header">
            {isEditing ? (
              <input
                className="input"
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') { setTitle(column.title); setIsEditing(false); }
                }}
              />
            ) : (
              <h3 onClick={() => setIsEditing(true)} className="column-title">
                {column.title} <span className="column-count">({column.cards?.length || 0})</span>
              </h3>
            )}
            <button onClick={handleDelete} className="btn btn-danger btn-sm">✕</button>
          </div>

          <Droppable droppableId={String(column.id)} type="CARD">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`card-list${snapshot.isDraggingOver ? ' drag-over' : ''}`}
              >
                {column.cards?.map((card, cardIndex) => (
                  <Draggable key={card.id} draggableId={String(card.id)} index={cardIndex}>
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        onClick={() => onSelectCard(card)}
                        className={`kanban-card${dragSnapshot.isDragging ? ' dragging' : ''}${card.isCompleted ? ' done' : ''}`}
                      >
                        {card.labels?.length > 0 && (
                          <div>
                            {card.labels.map((label) => (
                              <span key={label.id} style={{ backgroundColor: label.color }} className="label-pill">
                                {label.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <p>{card.title}</p>
                        {card.dueDate && <p className="text-muted" style={{ marginTop: 6, fontSize: 11 }}>{card.dueDate}</p>}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {isAddingCard ? (
            <form onSubmit={handleCreateCard} className="form-stack" style={{ marginTop: 8 }}>
              <textarea
                className="textarea"
                autoFocus
                rows="2"
                placeholder="Card title..."
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
              />
              <div className="btn-group">
                <button type="submit" className="btn btn-primary btn-sm">Add</button>
                <button type="button" onClick={() => { setIsAddingCard(false); setNewCardTitle(''); }} className="btn btn-ghost btn-sm">Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setIsAddingCard(true)} className="add-card-btn">+ Add a card</button>
          )}
        </div>
      )}
    </Draggable>
  );
}
