import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import Column from './coloumn.jsx';
import CardModal from './card.jsx';
import api from '../api/axios';
import useDebounce from '../../hooks/useDebounce';


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
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 250);
  // Filter States
const [showFilters, setShowFilters] = useState(false);
const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'incomplete'
const [filterDueDate, setFilterDueDate] = useState('all'); // 'all', 'overdue', 'today'
const [filterLabels, setFilterLabels] = useState([]); // Array of label IDs
  

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

const columns = board?.columns;
const displayColumns = useMemo(() => {
  if (!columns) return [];

  const query = debouncedSearch.toLowerCase().trim();
  
  // Get today's date string in YYYY-MM-DD format for accurate comparison
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' local time

  return columns.map((col) => ({
    ...col,
    cards: (col.cards || []).filter((card) => {
      // 1. Search
      const titleMatch = card.title?.toLowerCase().includes(query);
      const descMatch = card.description?.toLowerCase().includes(query);
      const matchesSearch = !query || titleMatch || descMatch;

      // 2. Status
      let matchesStatus = true;
      if (filterStatus === 'completed') matchesStatus = card.isCompleted;
      if (filterStatus === 'incomplete') matchesStatus = !card.isCompleted;

      // 3. Due Date
      let matchesDue = true;
      if (filterDueDate === 'today') {
        matchesDue = card.dueDate === todayStr;
      } else if (filterDueDate === 'overdue') {
        matchesDue = card.dueDate && card.dueDate < todayStr && !card.isCompleted;
      }

      // 4. Labels (Card must have at least one of the selected labels)
      let matchesLabels = true;
      if (filterLabels.length > 0) {
        matchesLabels = card.labels?.some((lbl) => filterLabels.includes(lbl.id));
      }

      return matchesSearch && matchesStatus && matchesDue && matchesLabels;
    }),
  }));
}, [columns, debouncedSearch, filterStatus, filterDueDate, filterLabels]);

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
        {/* Search Bar */}
<div className="relative flex items-center">
  <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search cards by title or description..."
    className="w-64 md:w-80 text-xs border border-gray-300 rounded-lg pl-8 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
  />
  <span className="absolute left-2.5 text-gray-400 text-xs pointer-events-none">🔍</span>
  {searchTerm && (
    <button
      onClick={() => setSearchTerm('')}
      className="absolute right-2 text-xs text-gray-400 hover:text-gray-600"
    >
      ✕
    </button>
  )}
</div>
{/* Filter Toggle Button */}
  <button
    onClick={() => setShowFilters(!showFilters)}
    className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${
      showFilters || filterStatus !== 'all' || filterDueDate !== 'all' || filterLabels.length > 0
        ? 'bg-blue-100 text-blue-700'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    ⚙️ Filters
  </button>
      </header>
      {/* Filter Toolbar Sub-header */}
{showFilters && (
  <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap gap-6 items-center shadow-sm text-sm">
    {/* Status Filter */}
    <div className="flex items-center gap-2">
      <span className="font-semibold text-gray-600 text-xs">Status:</span>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="text-xs border border-gray-300 rounded p-1 outline-none"
      >
        <option value="all">All</option>
        <option value="incomplete">Incomplete</option>
        <option value="completed">Completed</option>
      </select>
    </div>

    {/* Due Date Filter */}
    <div className="flex items-center gap-2">
      <span className="font-semibold text-gray-600 text-xs">Due:</span>
      <select
        value={filterDueDate}
        onChange={(e) => setFilterDueDate(e.target.value)}
        className="text-xs border border-gray-300 rounded p-1 outline-none"
      >
        <option value="all">Any time</option>
        <option value="today">Due Today</option>
        <option value="overdue">Overdue</option>
      </select>
    </div>

    {/* Labels Filter */}
    <div className="flex items-center gap-2">
      <span className="font-semibold text-gray-600 text-xs">Labels:</span>
      <div className="flex flex-wrap gap-1">
        {board.labels?.map((lbl) => {
          const isActive = filterLabels.includes(lbl.id);
          return (
            <button
              key={lbl.id}
              onClick={() => {
                setFilterLabels((prev) =>
                  isActive ? prev.filter((id) => id !== lbl.id) : [...prev, lbl.id]
                );
              }}
              style={{ backgroundColor: isActive ? lbl.color : '#f3f4f6', color: isActive ? '#fff' : '#374151' }}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium transition"
            >
              {lbl.name}
            </button>
          );
        })}
      </div>
    </div>

    {/* Clear All Filters */}
    {(filterStatus !== 'all' || filterDueDate !== 'all' || filterLabels.length > 0) && (
      <button
        onClick={() => {
          setFilterStatus('all');
          setFilterDueDate('all');
          setFilterLabels([]);
        }}
        className="text-xs text-red-500 hover:text-red-700 ml-auto font-medium"
      >
        Clear Filters
      </button>
    )}
  </div>
)}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <main ref={provided.innerRef} {...provided.droppableProps} className="board-canvas">
              {displayColumns.map((col, index) => (
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
