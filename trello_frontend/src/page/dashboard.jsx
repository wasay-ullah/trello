import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3000/api/boards';

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Unable to log out');
      }

      navigate('/login', { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  // 1. Fetch all boards on initial load
  useEffect(() => {
    fetch(API_BASE, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch boards');
        return res.json();
      })
      .then((data) => setBoards(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Open modal for new board or edit
  const openCreateModal = () => {
    setEditingBoard(null);
    setFormData({ title: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (board, e) => {
    e.stopPropagation(); // Avoid navigating to board page
    setEditingBoard(board);
    setFormData({ title: board.title, description: board.description || '' });
    setIsModalOpen(true);
  };

  // 2. Handle Create & Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingBoard) {
      // Edit Board
      const res = await fetch(`${API_BASE}/${editingBoard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated = await res.json();
        setBoards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        setIsModalOpen(false);
      }
    } else {
      // Create Board
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const created = await res.json();
        setBoards((prev) => [created, ...prev]);
        setIsModalOpen(false);
      }
    }
  };

  // 3. Delete Board with confirmation
  const handleDelete = async (id, title, e) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirmed) return;

    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.ok) {
      setBoards((prev) => prev.filter((b) => b.id !== id));
    }
  };

  if (loading) return <div className="p-8 text-gray-600">Loading your boards...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Your Boards</h1>
          <p className="text-sm text-gray-500">Manage and organize your projects</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm font-medium transition"
          >
            + Create New Board
          </button>
          <button
            onClick={handleLogout}
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium transition"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Boards Grid */}
      {boards.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">You don't have any boards yet.</p>
          <button
            onClick={openCreateModal}
            className="text-blue-600 font-medium hover:underline"
          >
            Create your first board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              onClick={() => navigate(`/board/${board.id}`)}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{board.title}</h2>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {board.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>
                  Updated {new Date(board.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => openEditModal(board, e)}
                    className="text-gray-600 hover:text-blue-600 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleDelete(board.id, board.title, e)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingBoard ? 'Edit Board' : 'Create New Board'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Board Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Website Redesign"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe what this board is for"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                >
                  {editingBoard ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}