import { describe, expect, it } from 'vitest'
import { addTodo, removeTodo, toggleTodo, type Todo } from './todos'

const a: Todo = { id: 'a', text: 'Buy milk', done: false }
const b: Todo = { id: 'b', text: 'Walk dog', done: true }

describe('addTodo', () => {
  it('appends a new not-done todo with a unique id, leaving the input list untouched', () => {
    const list = [a]
    const result = addTodo(list, 'Read book')
    expect(result).toHaveLength(2)
    expect(result[0]).toBe(a)
    expect(result[1]).toMatchObject({ text: 'Read book', done: false })
    expect(result[1].id).not.toBe(a.id)
    expect(list).toEqual([a])
  })

  it('trims surrounding whitespace', () => {
    expect(addTodo([], '  Read book \n')[0].text).toBe('Read book')
  })

  it.each(['', '   ', '\t\n'])('rejects empty or whitespace-only text %j', (text) => {
    const list = [a]
    expect(addTodo(list, text)).toBe(list)
  })
})

describe('toggleTodo', () => {
  it('toggles the matching todo in both directions and keeps the others', () => {
    const once = toggleTodo([a, b], 'a')
    expect(once).toEqual([{ ...a, done: true }, b])
    expect(once[1]).toBe(b)
    expect(toggleTodo(once, 'a')).toEqual([a, b])
    expect(toggleTodo([a, b], 'b')[1].done).toBe(false)
  })

  it('leaves the list unchanged for an unknown id', () => {
    expect(toggleTodo([a, b], 'zzz')).toEqual([a, b])
  })
})

describe('removeTodo', () => {
  it('removes only the matching todo', () => {
    expect(removeTodo([a, b], 'a')).toEqual([b])
  })

  it('leaves the list unchanged for an unknown id', () => {
    expect(removeTodo([a, b], 'zzz')).toEqual([a, b])
  })
})
