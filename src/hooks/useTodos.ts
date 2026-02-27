import { useState, useEffect, useCallback } from 'react';
import {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
  subscribeTodos,
} from '../lib/todoService';
import type { Todo, CreateTodoPayload, UpdateTodoPayload } from '../types/todo';

interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  addTodo: (payload: CreateTodoPayload) => Promise<void>;
  updateTodo: (id: string, payload: UpdateTodoPayload) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string, currentValue: boolean) => Promise<void>;
  clearError: () => void;
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown, context: string) => {
    const message = err instanceof Error ? err.message : `Unknown error in ${context}`;
    console.error(`[useTodos] ${context}:`, err);
    setError(message);
  };

  // Initial fetch
  useEffect(() => {
    let cancelled = false;

    const fetchTodos = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTodos();
        if (!cancelled) setTodos(data);
      } catch (err) {
        if (!cancelled) handleError(err, 'fetchTodos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTodos();
    return () => { cancelled = true; };
  }, []);

  // Real-time subscription
  useEffect(() => {
    const channel = subscribeTodos(
      // INSERT: prepend to list (newest first)
      (newTodo) => setTodos((prev) => [newTodo, ...prev]),
      // UPDATE: replace in-place
      (updatedTodo) =>
        setTodos((prev) =>
          prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
        ),
      // DELETE: remove by id
      (deletedId) =>
        setTodos((prev) => prev.filter((t) => t.id !== deletedId))
    );

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleAddTodo = useCallback(async (payload: CreateTodoPayload) => {
    setError(null);
    try {
      // Optimistic insert is handled by the real-time subscription
      await addTodo(payload);
    } catch (err) {
      handleError(err, 'addTodo');
    }
  }, []);

  const handleUpdateTodo = useCallback(async (id: string, payload: UpdateTodoPayload) => {
    setError(null);
    try {
      await updateTodo(id, payload);
    } catch (err) {
      handleError(err, 'updateTodo');
    }
  }, []);

  const handleDeleteTodo = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteTodo(id);
    } catch (err) {
      handleError(err, 'deleteTodo');
    }
  }, []);

  const handleToggleTodo = useCallback(async (id: string, currentValue: boolean) => {
    setError(null);
    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_complete: !currentValue } : t))
    );
    try {
      await toggleTodo(id, currentValue);
    } catch (err) {
      // Revert optimistic update on failure
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_complete: currentValue } : t))
      );
      handleError(err, 'toggleTodo');
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    todos,
    loading,
    error,
    addTodo: handleAddTodo,
    updateTodo: handleUpdateTodo,
    deleteTodo: handleDeleteTodo,
    toggleTodo: handleToggleTodo,
    clearError,
  };
}
