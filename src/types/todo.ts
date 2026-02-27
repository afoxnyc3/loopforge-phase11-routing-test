/**
 * Shared TypeScript types for the Todo domain.
 *
 * This file defines the canonical Todo interface and all
 * input/output shapes used across the data access layer
 * and UI components.
 */

// ============================================================
// Core Todo entity — mirrors the Supabase `todos` table columns
// ============================================================
export interface Todo {
  id: string;
  title: string;
  description: string | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Input types for data access layer functions
// ============================================================

/** Fields required to create a new todo */
export interface CreateTodoInput {
  title: string;
  description?: string | null;
}

/** Fields that can be updated on an existing todo (all optional) */
export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  is_complete?: boolean;
}

// ============================================================
// Component prop types
// ============================================================

export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, currentValue: boolean) => void;
  onDelete: (id: string) => void;
}

export interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string, currentValue: boolean) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export interface TodoFormProps {
  onSubmit: (input: CreateTodoInput) => Promise<void>;
  isSubmitting: boolean;
}
