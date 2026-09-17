import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Column from './coloumn.jsx';
import CardModal from './card.jsx';

const API_BASE = 'http://localhost:3000/api';

export default function BoardView() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Board title inline edit
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState('');

  // Add column state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // Selected card for detail modal
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch(`${API_BASE}/boards/${boardId}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load board');
        const data = await res.json();
        setBoard(data);
        setTitleText(data.title);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

  const handleSaveTitle = async () => {
    setIsEditingTitle(false);
    if (!titleText.trim() || titleText === board.title) {
      setTitleText(board.title);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: titleText.trim() }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBoard((prev) => ({ ...prev, title: updated.title }));
      } else {
        setTitleText(board.title);
      }
    } catch (err) {
      console.error(err);
      setTitleText(board.title);
    }
  };

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/boards/${boardId}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newColumnTitle.trim() }),
      });

      if (res.ok) {
        const createdColumn = await res.json();
        createdColumn.cards = []; // default cards array
        setBoard((prev) => ({
          ...prev,
          columns: [...(prev.columns || []), createdColumn],
        }));
        setNewColumnTitle('');
        setIsAddingColumn(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleColumnUpdated = (updatedColumn) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === updatedColumn.id ? { ...col, title: updatedColumn.title } : col
      ),
    }));
  };

  const handleColumnDeleted = (columnId) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.filter((col) => col.id !== columnId),
    }));
  };

  // Card Handlers
  const handleCardAdded = (columnId, newCard) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId ? { ...col, cards: [...(col.cards || []), newCard] } : col
      ),
    }));
  };

  const handleCardUpdated = (updatedCard) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === updatedCard.columnId
          ? {
              ...col,
              cards: col.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
            }
          : col
      ),
    }));
  };

  const handleCardDeleted = (cardId, columnId) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.filter((c) => c.id !== cardId),
            }
          : col
      ),
    }));
  };

  if (loading) return <div className="p-8 text-gray-500">Loading board...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center gap-1"
          >
            ← Boards
          </button>
          <span className="text-gray-300">|</span>
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') {
                  setTitleText(board.title);
                  setIsEditingTitle(false);
                }
              }}
              className="text-xl font-bold text-gray-800 bg-white border border-blue-500 rounded px-2 py-0.5 outline-none shadow-sm"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename board"
              className="text-xl font-bold text-gray-800 cursor-pointer hover:bg-gray-100 px-2 py-0.5 rounded transition"
            >
              {board.title}
            </h1>
          )}
        </div>
      </header>

      {/* Horizontal Kanban Canvas */}
      <main className="flex-1 p-6 overflow-x-auto flex items-start gap-4">
        {board.columns &&
          board.columns.map((col) => (
            <Column
              key={col.id}
              column={col}
              onColumnUpdated={handleColumnUpdated}
              onColumnDeleted={handleColumnDeleted}
              onCardAdded={handleCardAdded}
              onSelectCard={(card) => setSelectedCard(card)}
            />
          ))}

        {/* Add Column Section */}
        {isAddingColumn ? (
          <form
            onSubmit={handleAddColumn}
            className="w-72 bg-gray-100 rounded-xl p-3 shrink-0 shadow-sm border border-gray-200"
          >
            <input
              type="text"
              autoFocus
              placeholder="Enter column title..."
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-medium shadow-sm transition"
              >
                Add Column
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingColumn(false);
                  setNewColumnTitle('');
                }}
                className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1.5"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingColumn(true)}
            className="w-72 bg-white/70 hover:bg-white text-gray-600 hover:text-gray-800 text-sm font-medium py-2.5 px-4 rounded-xl border border-dashed border-gray-300 shrink-0 text-left transition flex items-center gap-2 shadow-sm"
          >
            <span className="text-lg leading-none">+</span> Add another column
          </button>
        )}
      </main>

      {/* Card Details Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onCardUpdated={handleCardUpdated}
          onCardDeleted={handleCardDeleted}
        />
      )}
    </div>
  );
}