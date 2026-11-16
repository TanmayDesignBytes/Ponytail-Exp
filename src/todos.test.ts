import { describe, expect, it } from 'vitest'
import { addTodo, deleteTodo, toggleTodo, type Todo } from './todos.ts'

const a: Todo = { id: 'a', text: 'Buy milk', done: false }
const b: Todo = { id: 'b', text: 'Walk dog', done: true }
const c: Todo = { id: 'c', text: 'Write tests', done: false }

function frozen(todos: Todo[]): readonly Todo[] {
  return Object.freeze(todos.map((t) => Object.freeze({ ...t })))
}

describe('addTodo', () => {
  it('adds a todo with the given id, text and done=false', () => {
    expect(addTodo([], 'Buy milk', 'x')).toEqual([
      { id: 'x', text: 'Buy milk', done: false },
    ])
  })

  it('trims surrounding whitespace from the text', () => {
    expect(addTodo([], '  \t Buy milk \n ', 'x')).toEqual([
      { id: 'x', text: 'Buy milk', done: false },
    ])
  })

  it('preserves internal whitespace', () => {
    expect(addTodo([], ' Buy  oat milk ', 'x')[0].text).toBe('Buy  oat milk')
  })

  it.each(['', ' ', '   ', '\t', '\n', ' \t\n\r '])(
    'rejects empty or whitespace-only text %j and returns the same array',
    (text) => {
      const todos = frozen([a])
      expect(addTodo(todos, text, 'x')).toBe(todos)
    },
  )

  it('appends to the end, keeping existing todos in order', () => {
    const result = addTodo([a, b], 'Write tests', 'c')
    expect(result.map((t) => t.id)).toEqual(['a', 'b', 'c'])
  })

  it('allows duplicate text', () => {
    const result = addTodo([a], 'Buy milk', 'a2')
    expect(result.map((t) => t.text)).toEqual(['Buy milk', 'Buy milk'])
  })

  it('does not mutate the input array and returns a new one', () => {
    const todos = frozen([a])
    const result = addTodo(todos, 'New', 'x')
    expect(result).not.toBe(todos)
    expect(todos).toEqual([a])
  })

  it('is deterministic for the same inputs', () => {
    expect(addTodo([a], 'New', 'x')).toEqual(addTodo([a], 'New', 'x'))
  })
})

describe('toggleTodo', () => {
  it('marks a not-done todo as done', () => {
    expect(toggleTodo([a], 'a')).toEqual([{ ...a, done: true }])
  })

  it('marks a done todo as not done', () => {
    expect(toggleTodo([b], 'b')).toEqual([{ ...b, done: false }])
  })

  it('restores the original state when toggled twice', () => {
    expect(toggleTodo(toggleTodo([a, b], 'a'), 'a')).toEqual([a, b])
  })

  it('changes only the matching todo and keeps other references', () => {
    const result = toggleTodo([a, b, c], 'b')
    expect(result).toEqual([a, { ...b, done: false }, c])
    expect(result[0]).toBe(a)
    expect(result[2]).toBe(c)
  })

  it('does not mutate the input array or its todos', () => {
    const todos = frozen([a, b])
    toggleTodo(todos, 'a')
    expect(todos).toEqual([a, b])
  })

  it('leaves the list unchanged for an unknown id', () => {
    expect(toggleTodo([a, b], 'missing')).toEqual([a, b])
  })
})

describe('deleteTodo', () => {
  it('removes only the matching todo', () => {
    expect(deleteTodo([a, b, c], 'b')).toEqual([a, c])
  })

  it('can remove the last remaining todo', () => {
    expect(deleteTodo([a], 'a')).toEqual([])
  })

  it('does not mutate the input array', () => {
    const todos = frozen([a, b])
    const result = deleteTodo(todos, 'a')
    expect(result).not.toBe(todos)
    expect(todos).toEqual([a, b])
  })

  it('leaves the list unchanged for an unknown id', () => {
    expect(deleteTodo([a, b], 'missing')).toEqual([a, b])
  })

  it('handles an empty list', () => {
    expect(deleteTodo([], 'a')).toEqual([])
  })
})
