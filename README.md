# Todo List App

A simple, real-time todo list built with **React**, **Vite**, **TypeScript**, and **Supabase**.

## Features

- ✅ Create, read, update, and delete todos
- ✅ Toggle completion status with optimistic UI updates
- ✅ Real-time sync across browser tabs via Supabase Realtime
- ✅ Inline editing with keyboard shortcuts (Enter to save, Escape to cancel)
- ✅ Error handling with dismissible banners
- ✅ Accessible markup (ARIA labels, roles, live regions)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase project URL and anon key in `.env.local`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set up the database

Run the SQL schema from `schemas/database.sql` in your Supabase SQL editor.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── TodoForm.tsx  # Add new todo form
│   ├── TodoItem.tsx  # Individual todo row
│   └── TodoList.tsx  # List container
├── hooks/
│   └── useTodos.ts   # Custom hook: state + CRUD + realtime
├── lib/
│   ├── supabaseClient.ts  # Supabase JS client
│   └── todoService.ts     # Data access functions
├── pages/
│   └── TodoPage.tsx  # Main page layout
├── types/
│   └── todo.ts       # Todo TypeScript interface
├── App.tsx
├── main.tsx
└── index.css
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
