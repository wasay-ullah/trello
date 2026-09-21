import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    api.get('/api/boards')
      .then(({ data }) => setBoards(data))
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate('/login', {
            replace: true,
            state: { message: 'Your session could not be restored. Please log in again.' },
          });
          return;
        }
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

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

    try {
      if (editingBoard) {
        const { data: updated } = await api.put(`/api/boards/${editingBoard.id}`, formData);
        setBoards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      } else {
        const { data: created } = await api.post('/api/boards', formData);
        setBoards((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, title, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${title}"?`)) return;

    try {
      await api.delete(`/api/boards/${id}`);
      setBoards((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
    }
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
