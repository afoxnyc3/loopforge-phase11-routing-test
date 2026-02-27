import React, { useState } from 'react';
import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, currentState: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, title: string, description: string | null) => Promise<void>;
}

export function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async () => {
    await onToggle(todo.id, todo.is_complete);
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this todo?')) {
      await onDelete(todo.id);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setIsSaving(true);
    await onUpdate(todo.id, editTitle.trim(), editDescription.trim() || null);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description ?? '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li className="todo-item todo-item--editing">
        <form onSubmit={handleEditSubmit} className="todo-item__edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="todo-item__edit-input"
            placeholder="Todo title"
            required
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="todo-item__edit-textarea"
            placeholder="Description (optional)"
            rows={2}
          />
          <div className="todo-item__edit-actions">
            <button type="submit" disabled={isSaving} className="btn btn--primary btn--sm">
              {isSaving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleEditCancel}
              disabled={isSaving}
              className="btn btn--secondary btn--sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={`todo-item${todo.is_complete ? ' todo-item--complete' : ''}`}>
      <label className="todo-item__checkbox-label">
        <input
          type="checkbox"
          checked={todo.is_complete}
          onChange={handleToggle}
          className="todo-item__checkbox"
          aria-label={`Mark "${todo.title}" as ${todo.is_complete ? 'incomplete' : 'complete'}`}
        />
        <span className="todo-item__title">{todo.title}</span>
      </label>

      {todo.description && (
        <p className="todo-item__description">{todo.description}</p>
      )}

      <div className="todo-item__actions">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="btn btn--ghost btn--sm"
          aria-label={`Edit "${todo.title}"`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="btn btn--danger btn--sm"
          aria-label={`Delete "${todo.title}"`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
