import React, { useState } from 'react';
import type { CreateTodoPayload } from '../types/todo';

interface TodoFormProps {
  onSubmit: (payload: CreateTodoPayload) => Promise<void>;
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setIsSubmitting(true);
    await onSubmit({
      title: trimmedTitle,
      description: description.trim() || undefined,
    });
    setIsSubmitting(false);
    setTitle('');
    setDescription('');
    setShowDescription(false);
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form" aria-label="Add a new todo">
      <div className="todo-form__row">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="todo-form__input"
          required
          disabled={isSubmitting}
          aria-label="Todo title"
          maxLength={255}
        />
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="btn btn--primary"
        >
          {isSubmitting ? 'Adding…' : 'Add Todo'}
        </button>
      </div>

      <button
        type="button"
        className="todo-form__toggle-desc"
        onClick={() => setShowDescription((prev) => !prev)}
      >
        {showDescription ? '− Hide description' : '+ Add description'}
      </button>

      {showDescription && (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description…"
          className="todo-form__textarea"
          rows={3}
          disabled={isSubmitting}
          aria-label="Todo description"
          maxLength={1000}
        />
      )}
    </form>
  );
}
