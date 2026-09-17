import { useState } from 'react';

const API_BASE = 'http://localhost:3000/api';

export default function CardModal({ card, onClose, onCardUpdated, onCardDeleted }) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  const [isCompleted, setIsCompleted] = useState(card.isCompleted || false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          description,
          dueDate: dueDate || null,
          isCompleted,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        onCardUpdated(updated);
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this card?')) return;
    try {
      const res = await fetch(`${API_BASE}/cards/${card.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        onCardDeleted(card.id, card.columnId);
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Card Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className="rounded text-blue-600 w-4 h-4"
                />
                Mark as Completed
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Delete Card
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}