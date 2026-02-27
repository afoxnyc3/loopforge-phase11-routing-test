import React from 'react';
import type { Todo, UpdateTodoPayload } from '../types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string, currentState: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, payload: UpdateTodoPayload) => Promise<void>;
}

export function TodoList({ todos, onToggle, onDelete, onUpdate }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="todo-list__empty">
        <p>No todos yet. Add one above!</p>
      </div>
    );
  }

  const pending = todos.filter((t) => !t.is_complete);
  const completed = todos.filter((t) => t.is_complete);

  const handleUpdate = (id: string, title: string, description: string | null) =>
    onUpdate(id, { title, description });

  return (
    <div className="todo-list">
      {pending.length > 0 && (
        <section className="todo-list__section">
          <h2 className="todo-list__section-heading">Active ({pending.length})</h2>
          <ul className="todo-list__items">
            {pending.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </ul>
        </section>
      )}

      {completed.length > 0 && (
        <section className="todo-list__section todo-list__section--completed">
          <h2 className="todo-list__section-heading">Completed ({completed.length})</h2>
          <ul className="todo-list__items">
            {completed.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
