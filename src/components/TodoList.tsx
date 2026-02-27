import React from 'react';
import type { Todo, UpdateTodoPayload } from '../types/todo';
import { TodoItem } from './TodoItem';
import styles from './TodoList.module.css';

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  onToggle: (id: string, currentValue: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, payload: UpdateTodoPayload) => Promise<void>;
}

export function TodoList({ todos, loading, onToggle, onDelete, onUpdate }: TodoListProps) {
  if (loading) {
    return (
      <div className={styles.stateContainer} aria-live="polite" aria-busy="true">
        <div className={styles.spinner} aria-hidden="true" />
        <p className={styles.stateText}>Loading todos...</p>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className={styles.stateContainer} aria-live="polite">
        <p className={styles.emptyIcon} aria-hidden="true">✓</p>
        <p className={styles.stateText}>No todos yet. Add one above!</p>
      </div>
    );
  }

  const completedCount = todos.filter((t) => t.is_complete).length;
  const totalCount = todos.length;

  return (
    <section aria-label="Todo list">
      <div className={styles.header}>
        <h2 className={styles.heading}>Your Todos</h2>
        <span className={styles.badge}>
          {completedCount}/{totalCount} done
        </span>
      </div>
      <ul className={styles.list} aria-label={`${totalCount} todos, ${completedCount} completed`}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </ul>
    </section>
  );
}
