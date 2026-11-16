import { useState } from 'react'
import { addTodo, removeTodo, toggleTodo, type Todo } from './todos'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [text, setText] = useState('')

  return (
    <main>
      <h1>Todos</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setTodos((prev) => addTodo(prev, text))
          setText('')
        }}
      >
        <label htmlFor="new-todo">New todo</label>
        <input id="new-todo" value={text} onChange={(e) => setText(e.target.value)} />
        <button>Add</button>
      </form>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <label>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => setTodos((prev) => toggleTodo(prev, t.id))}
              />
              {t.text}
            </label>
            <button
              type="button"
              aria-label={`Delete ${t.text}`}
              onClick={() => setTodos((prev) => removeTodo(prev, t.id))}
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
