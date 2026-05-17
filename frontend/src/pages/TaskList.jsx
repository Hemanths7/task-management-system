import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const FILTERS = ['all', 'active', 'completed'];

function TaskList() {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const fetchTasks = useCallback(async () => {
    setError('');
    try {
      const res = await API.get('/tasks');
      setTasks(res.data);
    } catch {
      setError('Failed to load tasks. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Toggle completed status inline
  const handleToggle = async (task) => {
    try {
      const res = await API.put(`/tasks/${task.id}`, { completed: !task.completed });
      setTasks(prev => prev.map(t => t.id === task.id ? res.data : t));
    } catch {
      setError('Failed to update task status.');
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch {
      setError('Failed to delete task.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter logic
  const filteredTasks = tasks.filter(t => {
    if (filter === 'active')    return !t.completed;
    if (filter === 'completed') return  t.completed;
    return true;
  });

  // Stats
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active    = total - completed;

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="tasks-header">
        <h1 className="tasks-title">My <span>Tasks</span></h1>
        <Link to="/tasks/new" className="btn btn-primary" style={{ width: 'auto' }}>
          + New Task
        </Link>
      </div>

      {/* Stats */}
      <div className="tasks-stats">
        <div className="stat-card">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{completed}</div>
          <div className="stat-label">Done</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Content */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" style={{ borderTopColor: 'var(--accent)' }} />
          Loading your tasks…
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            {filter === 'completed' ? '✅' : filter === 'active' ? '⚡' : '📋'}
          </div>
          <div className="empty-title">
            {filter === 'completed' ? 'No completed tasks yet'
              : filter === 'active' ? 'No active tasks'
              : 'No tasks yet'}
          </div>
          <div className="empty-subtitle">
            {filter === 'all'
              ? 'Create your first task to get started!'
              : 'Try changing the filter above.'}
          </div>
          {filter === 'all' && (
            <Link to="/tasks/new" className="btn btn-primary" style={{ width: 'auto' }}>
              + Create Task
            </Link>
          )}
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.map(task => (
            <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
              {/* Checkbox */}
              <input
                type="checkbox"
                className="task-checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task)}
                title={task.completed ? 'Mark as active' : 'Mark as done'}
              />

              {/* Body */}
              <div className="task-body">
                <div className="task-title">{task.title}</div>
                {task.description && (
                  <div className="task-description">{task.description}</div>
                )}
                <div className="task-meta">
                  <span className={`priority-badge priority-${task.priority}`}>
                    {task.priority}
                  </span>
                  {task.created_at && (
                    <span className="task-date">{formatDate(task.created_at)}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="task-actions">
                <Link
                  to={`/tasks/edit/${task.id}`}
                  state={{ task }}
                  className="btn btn-secondary btn-icon"
                  title="Edit task"
                >
                  ✏️
                </Link>
                <button
                  className="btn btn-danger btn-icon"
                  onClick={() => handleDelete(task.id)}
                  disabled={deletingId === task.id}
                  title="Delete task"
                >
                  {deletingId === task.id
                    ? <span className="spinner" />
                    : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;
