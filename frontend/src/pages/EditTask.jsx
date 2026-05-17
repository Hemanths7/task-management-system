import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import API from '../api/axios';

function EditTask() {
  const { id }       = useParams();
  const location     = useLocation();
  const navigate     = useNavigate();

  const [form, setForm]         = useState({ title: '', description: '', completed: false, priority: 'medium' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(false);

  // Populate form — prefer state passed via Link, otherwise fetch from API
  useEffect(() => {
    const task = location.state?.task;
    if (task) {
      setForm({
        title:       task.title,
        description: task.description || '',
        completed:   task.completed,
        priority:    task.priority || 'medium',
      });
    } else {
      setFetching(true);
      API.get('/tasks')
        .then(res => {
          const found = res.data.find(t => t.id === parseInt(id, 10));
          if (found) {
            setForm({
              title:       found.title,
              description: found.description || '',
              completed:   found.completed,
              priority:    found.priority || 'medium',
            });
          } else {
            navigate('/tasks');
          }
        })
        .catch(() => navigate('/tasks'))
        .finally(() => setFetching(false));
    }
  }, [id, location.state, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Task title is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    setApiError('');
    try {
      await API.put(`/tasks/${id}`, form);
      navigate('/tasks');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading-container">
        <div className="spinner" style={{ borderTopColor: 'var(--accent)' }} />
        Loading task…
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/tasks" className="back-btn" title="Back to tasks">←</Link>
        <h1 className="page-title">Edit Task</h1>
      </div>

      <div className="task-form-card">
        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              type="text"
              name="title"
              placeholder="Task title"
              value={form.title}
              onChange={handleChange}
              autoFocus
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              name="description"
              placeholder="Task description (optional)"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-checkbox-row" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                className="form-checkbox"
                name="completed"
                checked={form.completed}
                onChange={handleChange}
              />
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                Mark as completed
              </span>
            </label>
          </div>

          <div className="form-actions">
            <Link to="/tasks" className="btn btn-secondary">Cancel</Link>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving…</> : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTask;
