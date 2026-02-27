import { useState, useEffect, useCallback } from 'react';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  subscribeToTodos,
} from '../lib/todoService';
import type { Todo, CreateTodoPayload, UpdateTodoPayload } from '../lib/types';

interface UseTodosState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

interface UseTodosReturn extends UseTodosState {
  addTodo: (payload: CreateTodoPayload) => Promise<void>;
  editTodo: (id: string, payload: UpdateTodoPayload) => Promise<void>;
  removeTodo: (id: string) => Promise<void>;
  toggleComplete: (id: string, currentValue: boolean) => Promise<void>;
  clearError: () => void;
}

export function useTodos(): UseTodosReturn {
  const [state, setState] = useState<UseTodosState>({
    todos: [],
    loading: true,
    error: null,
  });

  // -------------------------------------------------------------------------
  // Initial load
  // -------------------------------------------------------------------------
  const fetchTodos = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const result = await getTodos();
    if (result.error) {
      setState((prev) => ({ ...prev, loading: false, error: result.error!.message }));
    } else {
      setState({ todos: result.data, loading: false, error: null });
    }
  }, []);

  // -------------------------------------------------------------------------
  // Real-time subscription — keeps local state in sync without re-fetching
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetchTodos();

    const unsubscribe = subscribeToTodos((event) => {
      setState((prev) => {
        switch (event.eventType) {
          case 'INSERT': {
            if (!event.new) return prev;
            // Avoid duplicates (optimistic updates may have already added it)
            const exists = prev.todos.some((t) => t.id === event.new!.id);
            if (exists) return prev;
            return { ...prev, todos: [event.new, ...prev.todos] };
          }
          case 'UPDATE': {
            if (!event.new) return prev;
            return {
              ...prev,
              todos: prev.todos.map((t) =>
                t.id === event.new!.id ? event.new! : t
              ),
            };
          }
          case 'DELETE': {
            const deletedId = event.old?.id;
            if (!deletedId) return prev;
            return {
              ...prev,
              todos: prev.todos.filter((t) => t.id !== deletedId),
            };
          }
          default:
            return prev;
        }
      });
    });

    return unsubscribe;
  }, [fetchTodos]);

  // -------------------------------------------------------------------------
  // Mutations
  // -------------------------------------------------------------------------
  const addTodo = useCallback(async (payload: CreateTodoPayload) => {
    const result = await createTodo(payload);
    if (result.error) {
      setState((prev) => ({ ...prev, error: result.error!.message }));
    }
    // Real-time INSERT event will update the list
  }, []);

  const editTodo = useCallback(async (id: string, payload: UpdateTodoPayload) => {
    const result = await updateTodo(id, payload);
    if (result.error) {
      setState((prev) => ({ ...prev, error: result.error!.message }));
    }
    // Real-time UPDATE event will update the list
  }, []);

  const removeTodo = useCallback(async (id: string) => {
    const result = await deleteTodo(id);
    if (result.error) {
      setState((prev) => ({ ...prev, error: result.error!.message }));
    }
    // Real-time DELETE event will update the list
  }, []);

  const toggleComplete = useCallback(async (id: string, currentValue: boolean) => {
    const result = await toggleTodoComplete(id, currentValue);
    if (result.error) {
      setState((prev) => ({ ...prev, error: result.error!.message }));
    }
    // Real-time UPDATE event will update the list
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    todos: state.todos,
    loading: state.loading,
    error: state.error,
    addTodo,
    editTodo,
    removeTodo,
    toggleComplete,
    clearError,
  };
}
