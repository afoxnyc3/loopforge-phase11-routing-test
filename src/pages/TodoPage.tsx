import React from 'react';
import { useTodos } from '../hooks/useTodos';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';

export function TodoPage() {
  const { todos, loading, error, createTodo, updateTodo, toggleTodo, deleteTodo } = useTodos();

  return (
    <main className="todo-page">
      <header className="todo-page__header">
        <h1 className="todo-page__title">My Todos</h1>
        {todos.length > 0 && (
          <p className="todo-page__summary">
            {todos.filter((t) => !t.is_complete).length} remaining /{' '}
            {todos.length} total
          </p>
        )}
      </header>

      <section className="todo-page__form-section" aria-label="Add new todo">
        <TodoForm onSubmit={createTodo} />
      </section>

      {error && (
        <div className="todo-page__error" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      <section className="todo-page__list-section" aria-label="Todo list">
        {loading ? (
          <div className="todo-page__loading" aria-live="polite">
            Loading todos…
          </div>
        ) : (
          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onUpdate={updateTodo}
          />
        )}
      </section>
    </main>
  );
}
