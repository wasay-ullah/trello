import { useState } from 'react';

const API_BASE = 'http://localhost:3000/api';

export default function Column({
  column,
  onColumnUpdated,
  onColumnDeleted,
  onCardAdded,
  onSelectCard,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);

  // Add Card inline state
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

      if (res.ok) {
        const updated = await res.json();
        onColumnUpdated(updated);
      } else {
        setTitle(column.title);
      }
    } catch (err) {
      console.error(err);
      setTitle(column.title);
    }
  };

  const handleDelete = async () => {
    const hasCards = column.cards && column.cards.length > 0;
    const confirmMsg = hasCards
      ? `This column contains ${column.cards.length} cards. Are you sure you want to delete it?`
      : `Delete column "${column.title}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API_BASE}/columns/${column.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        onColumnDeleted(column.id);
      }
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
        const createdCard = await res.json();
        onCardAdded(column.id, createdCard);
        setNewCardTitle('');
        setIsAddingCard(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-72 bg-gray-100 rounded-xl p-3 shrink-0 shadow-sm border border-gray-200 flex flex-col max-h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 mb-3 px-1">
        {isEditing ? (
          <input
            type="text"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') {
                setTitle(column.title);
                setIsEditing(false);
              }
            }}
            className="text-sm font-semibold text-gray-800 bg-white border border-blue-500 rounded px-2 py-0.5 outline-none w-full"
          />
        ) : (
          <h3
            onClick={() => setIsEditing(true)}
            className="text-sm font-semibold text-gray-700 hover:bg-gray-200 px-2 py-0.5 rounded cursor-pointer truncate flex-1"
          >
            {column.title} <span className="text-xs text-gray-400 font-normal">({column.cards?.length || 0})</span>
          </h3>
        )}

        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 p-1 text-sm rounded hover:bg-gray-200 transition"
        >
          ✕
        </button>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-[40px] px-0.5 pb-2">
        {column.cards && column.cards.length > 0 ? (
          column.cards.map((card) => (
            <div
              key={card.id}
              onClick={() => onSelectCard(card)}
              className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow hover:border-gray-300 transition cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium ${card.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {card.title}
                </p>
                {card.isCompleted && <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">✓</span>}
              </div>

              {card.dueDate && (
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <span>📅</span>
                  <span>{card.dueDate}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          !isAddingCard && (
            <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg">
              No cards yet
            </div>
          )
        )}

        {/* Add Card Inline Form */}
        {isAddingCard && (
          <form onSubmit={handleCreateCard} className="bg-white p-2.5 rounded-lg border border-blue-400 shadow-sm">
            <textarea
              autoFocus
              rows="2"
              placeholder="Enter a title for this card..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              className="w-full text-sm outline-none resize-none"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-medium shadow-sm transition"
              >
                Add Card
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
                className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1.5"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Add Card Button Trigger */}
      {!isAddingCard && (
        <button
          onClick={() => setIsAddingCard(true)}
          className="mt-2 w-full text-left text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-200 py-1.5 px-2 rounded flex items-center gap-1 transition"
        >
          <span>+</span> Add a card
        </button>
      )}
    </div>
  );
}