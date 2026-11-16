export type Todo = { id: string; text: string; done: boolean }

// shortcut: crypto.randomUUID needs https or localhost, add a fallback id if served over plain http
export function addTodo(todos: Todo[], text: string): Todo[] {
  const trimmed = text.trim()
  if (!trimmed) return todos
  return [...todos, { id: crypto.randomUUID(), text: trimmed, done: false }]
}

export function toggleTodo(todos: Todo[], id: string): Todo[] {
  return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
}

export function removeTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter((t) => t.id !== id)
}
