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
      if (!response.ok) throw new Error('Unable to log out');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

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

  const openCreateModal = () => {
    setEditingBoard(null);
    setFormData({ title: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (board, e) => {
    e.stopPropagation();
    setEditingBoard(board);
    setFormData({ title: board.title, description: board.description || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingBoard) {
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

  const handleDelete = async (id, title, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${title}"?`)) return;

    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) setBoards((prev) => prev.filter((b) => b.id !== id));
  };

  if (loading) return <div className="loading">Loading your boards...</div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="title">Your Boards</h1>
          <p className="subtitle">Manage and organize your projects</p>
        </div>
        <div className="btn-group">
          <button onClick={openCreateModal} className="btn btn-accent">+ New board</button>
          <button onClick={handleLogout} className="btn btn-ghost">Log out</button>
        </div>
      </header>

      {boards.length === 0 ? (
        <div className="empty-state">
          <p className="text-muted">You don't have any boards yet.</p>
          <button onClick={openCreateModal} className="btn btn-text">Create your first board</button>
        </div>
      ) : (
        <div className="board-grid">
          {boards.map((board) => (
            <div key={board.id} onClick={() => navigate(`/board/${board.id}`)} className="card-board">
              <div>
                <h2>{board.title}</h2>
                <p>{board.description || 'No description provided.'}</p>
              </div>
              <div className="card-footer">
                <span>
                  Updated {new Date(board.updatedAt).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
                <div className="btn-group">
                  <button onClick={(e) => openEditModal(board, e)} className="btn btn-text btn-sm">Edit</button>
                  <button onClick={(e) => handleDelete(board.id, board.title, e)} className="btn btn-danger btn-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingBoard ? 'Edit board' : 'New board'}</h3>
            <form onSubmit={handleSubmit} className="form-stack">
              <div className="field">
                <label className="label">Title *</label>
                <input
                  className="input"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Website Redesign"
                />
              </div>
              <div className="field">
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this board for?"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingBoard ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
