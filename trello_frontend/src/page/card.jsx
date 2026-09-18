import { useState } from 'react';

const API_BASE = 'http://localhost:3000/api';

export default function CardModal({ card, boardId, boardLabels = [], onLabelCreated, onClose, onCardUpdated, onCardDeleted }) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  const [isCompleted, setIsCompleted] = useState(card.isCompleted || false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#0265d2');

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    const response = await fetch(`${API_BASE}/boards/${boardId}/labels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: newLabelName.trim(), color: newLabelColor }),
    });
    if (response.ok) {
      onLabelCreated(await response.json());
      setNewLabelName('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, description, dueDate: dueDate || null, isCompleted }),
      });
      if (res.ok) {
        onCardUpdated(await res.json());
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this card?')) return;
    try {
      const res = await fetch(`${API_BASE}/cards/${card.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        onCardDeleted(card.id, card.columnId);
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>Card details</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>

        <form onSubmit={handleSave} className="form-stack" style={{ marginTop: 16 }}>
          <div className="field">
            <label className="label">Title</label>
            <input className="input" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="field">
            <label className="label">Description</label>
            <textarea className="textarea" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details..." />
          </div>

          <div className="field">
            <label className="label">Labels</label>
            <div className="btn-group" style={{ marginBottom: 8 }}>
              {boardLabels.map((lbl) => {
                const isAttached = card.labels?.some((l) => l.id === lbl.id);
                return (
                  <button
                    key={lbl.id}
                    type="button"
                    onClick={async () => {
                      const res = await fetch(`${API_BASE}/cards/${card.id}/labels/${lbl.id}`, {
                        method: isAttached ? 'DELETE' : 'POST',
                        credentials: 'include',
                      });
                      if (res.ok) onCardUpdated(await res.json());
                    }}
                    style={{ backgroundColor: isAttached ? lbl.color : 'var(--surface)', color: isAttached ? '#fff' : 'var(--text)' }}
                    className="btn btn-sm"
                  >
                    {lbl.name}{isAttached && ' ✓'}
                  </button>
                );
              })}
            </div>
            <div className="btn-group">
              <input className="input" type="text" value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} placeholder="New label" />
              <input type="color" value={newLabelColor} onChange={(e) => setNewLabelColor(e.target.value)} title="Label color" style={{ width: 36, height: 36, border: 'none', cursor: 'pointer' }} />
              <button type="button" onClick={handleCreateLabel} className="btn btn-ghost btn-sm">Add</button>
            </div>
          </div>

          <div className="btn-group">
            <div className="field" style={{ flex: 1 }}>
              <label className="label">Due date</label>
              <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <label className="btn-group" style={{ marginTop: 24, cursor: 'pointer' }}>
              <input type="checkbox" checked={isCompleted} onChange={(e) => setIsCompleted(e.target.checked)} />
              Completed
            </label>
          </div>

          <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
            <button type="button" onClick={handleDelete} className="btn btn-danger">Delete</button>
            <div className="btn-group">
              <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
