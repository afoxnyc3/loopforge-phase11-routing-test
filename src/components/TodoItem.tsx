import React, { useState } from 'react';
import type { Todo, UpdateTodoPayload } from '../types/todo';
import styles from './TodoItem.module.css';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, currentValue: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, payload: UpdateTodoPayload) => Promise<void>;
}

export function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async () => {
    await onToggle(todo.id, todo.is_complete);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${todo.title}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(todo.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSave = async () => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;

    setSaving(true);
    try {
      await onUpdate(todo.id, {
        title: trimmedTitle,
        description: editDescription.trim() || null,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description ?? '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    }
    if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const formattedDate = new Date(todo.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <li
      className={`${styles.item} ${todo.is_complete ? styles.complete : ''}`}
      aria-label={`Todo: ${todo.title}${todo.is_complete ? ' (completed)' : ''}`}
    >
      {isEditing ? (
        <div className={styles.editForm}>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            autoFocus
            maxLength={255}
            aria-label="Edit todo title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            placeholder="Description (optional)"
            maxLength={1000}
            rows={2}
            aria-label="Edit todo description"
          />
          <div className={styles.editActions}>
            <button
              className={styles.saveButton}
              onClick={handleEditSave}
              disabled={saving || !editTitle.trim()}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              className={styles.cancelButton}
              onClick={handleEditCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.left}>
            <button
              className={`${styles.checkbox} ${todo.is_complete ? styles.checked : ''}`}
              onClick={handleToggle}
              aria-label={todo.is_complete ? 'Mark as incomplete' : 'Mark as complete'}
              aria-pressed={todo.is_complete}
            >
              {todo.is_complete && (
                <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className={styles.body}>
            <span className={styles.title}>{todo.title}</span>
            {todo.description && (
              <p className={styles.description}>{todo.description}</p>
            )}
            <span className={styles.date}>{formattedDate}</span>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.editButton}
              onClick={() => setIsEditing(true)}
              aria-label={`Edit "${todo.title}"`}
            >
              Edit
            </button>
            <button
              className={styles.deleteButton}
              onClick={handleDelete}
              disabled={deleting}
              aria-label={`Delete "${todo.title}"`}
            >
              {deleting ? '...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
