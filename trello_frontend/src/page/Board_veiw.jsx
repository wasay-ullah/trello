import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import Column from './coloumn.jsx';
import CardModal from './card.jsx';
import api from '../api/axios';

export default function BoardView() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const { data } = await api.get(`/api/boards/${boardId}`);
        if (!data?.id || !data.title) throw new Error('The server returned an invalid board.');
        setBoard(data);
        setTitleText(data.title);
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) setError('Please log in to view this board.');
        else if (status === 404) setError('Board not found or you do not have access.');
        else setError(err.message || 'Failed to load board.');
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
      const { data: updated } = await api.put(`/api/boards/${boardId}`, { title: titleText.trim() });
      setBoard((prev) => ({ ...prev, title: updated.title }));
    } catch (err) {
      console.error(err);
      setTitleText(board.title);
    }
  };

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    try {
      const { data: createdColumn } = await api.post(`/api/boards/${boardId}/columns`, {
        title: newColumnTitle.trim(),
      });
      createdColumn.cards = [];
      setBoard((prev) => ({ ...prev, columns: [...(prev.columns || []), createdColumn] }));
      setNewColumnTitle('');
      setIsAddingColumn(false);
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
    setBoard((prev) => ({ ...prev, columns: prev.columns.filter((col) => col.id !== columnId) }));
  };

  const handleCardAdded = (columnId, newCard) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId ? { ...col, cards: [...(col.cards || []), newCard] } : col
      ),
    }));
  };

  const handleCardUpdated = (updatedCard) => {
    setSelectedCard(updatedCard);
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === updatedCard.columnId
          ? { ...col, cards: col.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)) }
          : col
      ),
    }));
  };

  const handleLabelCreated = (createdLabel) => {
    setBoard((prev) => ({ ...prev, labels: [...(prev.labels || []), createdLabel] }));
  };

  const handleCardDeleted = (cardId, columnId) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) } : col
      ),
    }));
  };

  const handleDragEnd = async (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'COLUMN') {
      const reorderedColumns = Array.from(board.columns);
      const [movedColumn] = reorderedColumns.splice(source.index, 1);
      reorderedColumns.splice(destination.index, 0, movedColumn);
      setBoard((prev) => ({ ...prev, columns: reorderedColumns }));
      try {
        await api.patch('/api/columns/reorder', {
          columnUpdates: reorderedColumns.map((column, position) => ({ id: column.id, position })),
        });
      } catch (err) {
        console.error('Failed to save column order:', err);
      }
      return;
    }

    const sourceColumnId = Number(source.droppableId);
    const destinationColumnId = Number(destination.droppableId);
    const sourceColumn = board.columns.find((column) => column.id === sourceColumnId);
    const destinationColumn = board.columns.find((column) => column.id === destinationColumnId);
    if (!sourceColumn || !destinationColumn) return;

    const sourceCards = [...(sourceColumn.cards || [])];
    const destinationCards = sourceColumnId === destinationColumnId ? sourceCards : [...(destinationColumn.cards || [])];
    const [movedCard] = sourceCards.splice(source.index, 1);
    if (!movedCard) return;

    movedCard.columnId = destinationColumnId;
    destinationCards.splice(destination.index, 0, movedCard);

    const nextColumns = board.columns.map((column) => {
      if (column.id === sourceColumnId && sourceColumnId === destinationColumnId) return { ...column, cards: destinationCards };
      if (column.id === sourceColumnId) return { ...column, cards: sourceCards };
      if (column.id === destinationColumnId) return { ...column, cards: destinationCards };
      return column;
    });

    setBoard((prev) => ({ ...prev, columns: nextColumns }));

    const columnUpdates = [];
    sourceCards.forEach((card, position) => columnUpdates.push({ id: card.id, position, columnId: sourceColumnId }));
    if (sourceColumnId !== destinationColumnId) {
      destinationCards.forEach((card, position) => columnUpdates.push({ id: card.id, position, columnId: destinationColumnId }));
    }

    try {
      await api.patch('/api/cards/reorder', { columnUpdates });
    } catch (err) {
      console.error('Failed to save card positions:', err);
    }
  };

  if (loading) return <div className="loading">Loading board...</div>;

  if (error) {
    return (
      <div className="page">
        <p className="alert alert-error">{error}</p>
        <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-text">Back to boards</button>
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className="board-layout">
      <header className="app-header">
        <div className="breadcrumb">
          <button type="button" onClick={() => navigate('/dashboard')}>← Boards</button>
          <span>|</span>
          {isEditingTitle ? (
            <input
              className="input"
              type="text"
              autoFocus
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') { setTitleText(board.title); setIsEditingTitle(false); }
              }}
            />
          ) : (
            <h1 onClick={() => setIsEditingTitle(true)} title="Click to rename">{board.title}</h1>
          )}
        </div>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <main ref={provided.innerRef} {...provided.droppableProps} className="board-canvas">
              {board.columns?.map((col, index) => (
                <Column
                  key={col.id}
                  index={index}
                  column={col}
                  onColumnUpdated={handleColumnUpdated}
                  onColumnDeleted={handleColumnDeleted}
                  onCardAdded={handleCardAdded}
                  onSelectCard={setSelectedCard}
                />
              ))}
              {provided.placeholder}

              {isAddingColumn ? (
                <form onSubmit={handleAddColumn} className="column form-stack">
                  <input
                    className="input"
                    type="text"
                    autoFocus
                    placeholder="Column title..."
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                  />
                  <div className="btn-group">
                    <button type="submit" className="btn btn-primary btn-sm">Add</button>
                    <button type="button" onClick={() => { setIsAddingColumn(false); setNewColumnTitle(''); }} className="btn btn-ghost btn-sm">Cancel</button>
                  </div>
                </form>
              ) : (
                <button type="button" onClick={() => setIsAddingColumn(true)} className="add-column">+ Add column</button>
              )}
            </main>
          )}
        </Droppable>
      </DragDropContext>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          boardId={boardId}
          boardLabels={board.labels || []}
          onLabelCreated={handleLabelCreated}
          onClose={() => setSelectedCard(null)}
          onCardUpdated={handleCardUpdated}
          onCardDeleted={handleCardDeleted}
        />
      )}
    </div>
  );
}
