import React, { useState, type FormEvent } from 'react';
import type { CreateTodoPayload } from '../types/todo';
import styles from './TodoForm.module.css';

interface TodoFormProps {
  onAdd: (payload: CreateTodoPayload) => Promise<void>;
  disabled?: boolean;
}

export function TodoForm({ onAdd, disabled = false }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setValidationError('Title is required.');
      return;
    }

    setValidationError(null);
    setSubmitting(true);
    try {
      await onAdd({
        title: trimmedTitle,
        description: description.trim() || null,
      });
      setTitle('');
      setDescription('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Add new todo">
      <h2 className={styles.heading}>Add a Todo</h2>
      <div className={styles.field}>
        <label htmlFor="todo-title" className={styles.label}>
          Title <span aria-hidden="true" className={styles.required}>*</span>
        </label>
        <input
          id="todo-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (validationError) setValidationError(null);
          }}
          placeholder="What needs to be done?"
          disabled={disabled || submitting}
          aria-required="true"
          aria-invalid={validationError ? 'true' : undefined}
          aria-describedby={validationError ? 'title-error' : undefined}
          maxLength={255}
        />
        {validationError && (
          <p id="title-error" className={styles.error} role="alert">
            {validationError}
          </p>
        )}
      </div>
      <div className={styles.field}>
        <label htmlFor="todo-description" className={styles.label}>
          Description <span className={styles.optional}>(optional)</span>
        </label>
        <textarea
          id="todo-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          disabled={disabled || submitting}
          maxLength={1000}
          rows={3}
        />
      </div>
      <button
        type="submit"
        className={styles.submitButton}
        disabled={disabled || submitting || !title.trim()}
      >
        {submitting ? 'Adding...' : '+ Add Todo'}
      </button>
    </form>
  );
}
