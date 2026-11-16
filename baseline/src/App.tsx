import { useState, type FormEvent } from 'react'
import { addTodo, deleteTodo, toggleTodo, type Todo } from './todos.ts'

function App() {
  const [todos, setTodos] = useState<readonly Todo[]>([])
  const [text, setText] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = addTodo(todos, text, crypto.randomUUID())
    if (next === todos) return
    setTodos(next)
    setText('')
  }

  return (
    <main>
      <h1>Todos</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="new-todo">New todo</label>{' '}
        <input
          id="new-todo"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />{' '}
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => setTodos((prev) => toggleTodo(prev, todo.id))}
              />{' '}
              {todo.text}
            </label>{' '}
            <button
              type="button"
              aria-label={`Delete ${todo.text}`}
              onClick={() => setTodos((prev) => deleteTodo(prev, todo.id))}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
