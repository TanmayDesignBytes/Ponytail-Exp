export type Todo = {
  readonly id: string
  readonly text: string
  readonly done: boolean
}

/**
 * Appends a new todo with trimmed text. Returns the original array
 * unchanged (same reference) when the trimmed text is empty.
 */
export function addTodo(
  todos: readonly Todo[],
  text: string,
  id: string,
): readonly Todo[] {
  const trimmed = text.trim()
  if (trimmed === '') return todos
  return [...todos, { id, text: trimmed, done: false }]
}

/** Flips `done` on the todo with the given id; others are untouched. */
export function toggleTodo(todos: readonly Todo[], id: string): readonly Todo[] {
  return todos.map((todo) =>
    todo.id === id ? { ...todo, done: !todo.done } : todo,
  )
}

/** Removes the todo with the given id; others are untouched. */
export function deleteTodo(todos: readonly Todo[], id: string): readonly Todo[] {
  return todos.filter((todo) => todo.id !== id)
}
