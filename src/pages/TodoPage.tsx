import React from 'react';
import { useTodos } from '../hooks/useTodos';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';
import styles from './TodoPage.module.css';

export function TodoPage() {
  const {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearError,
  } = useTodos();

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>📝 Todo List</h1>
          <p className={styles.subtitle}>Powered by React + Supabase</p>
        </header>

        {error && (
          <div className={styles.errorBanner} role="alert" aria-live="assertive">
            <span className={styles.errorText}>⚠ {error}</span>
            <button className={styles.dismissButton} onClick={clearError} aria-label="Dismiss error">
              ✕
            </button>
          </div>
        )}

        <TodoForm onAdd={addTodo} disabled={loading} />

        <TodoList
          todos={todos}
          loading={loading}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onUpdate={updateTodo}
        />
      </div>
    </main>
  );
}
