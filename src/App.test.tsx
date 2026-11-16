// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App.tsx'

afterEach(cleanup)

function setup() {
  const user = userEvent.setup()
  render(<App />)
  const input = screen.getByLabelText('New todo') as HTMLInputElement
  const addButton = screen.getByRole('button', { name: 'Add' })
  return { user, input, addButton }
}

function todoTexts(): string[] {
  return screen
    .queryAllByRole('listitem')
    .map((li) => within(li).getByRole('checkbox').closest('label')!.textContent!.trim())
}

describe('App', () => {
  it('renders a labelled text input and an Add button', () => {
    const { input, addButton } = setup()
    expect(input.type).toBe('text')
    expect(addButton).toBeTruthy()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('adds a trimmed todo when Enter is pressed and clears the input', async () => {
    const { user, input } = setup()
    await user.type(input, '  Buy milk  {Enter}')
    expect(todoTexts()).toEqual(['Buy milk'])
    expect(input.value).toBe('')
  })

  it('adds a todo when the Add button is clicked and clears the input', async () => {
    const { user, input, addButton } = setup()
    await user.type(input, 'Walk dog')
    await user.click(addButton)
    expect(todoTexts()).toEqual(['Walk dog'])
    expect(input.value).toBe('')
  })

  it('appends todos in the order they were added', async () => {
    const { user, input } = setup()
    await user.type(input, 'First{Enter}')
    await user.type(input, 'Second{Enter}')
    expect(todoTexts()).toEqual(['First', 'Second'])
  })

  it('rejects empty and whitespace-only input via Enter and button', async () => {
    const { user, input, addButton } = setup()
    await user.type(input, '{Enter}')
    await user.click(addButton)
    await user.type(input, '   {Enter}')
    await user.click(addButton)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(input.value).toBe('   ')
  })

  it('gives each todo a real checkbox labelled by its text, unchecked by default', async () => {
    const { user, input } = setup()
    await user.type(input, 'Buy milk{Enter}')
    const checkbox = screen.getByRole('checkbox', { name: 'Buy milk' }) as HTMLInputElement
    expect(checkbox.tagName).toBe('INPUT')
    expect(checkbox.type).toBe('checkbox')
    expect(checkbox.checked).toBe(false)
  })

  it('toggles only the clicked todo done and back', async () => {
    const { user, input } = setup()
    await user.type(input, 'Buy milk{Enter}')
    await user.type(input, 'Walk dog{Enter}')
    const milk = screen.getByRole('checkbox', { name: 'Buy milk' }) as HTMLInputElement
    const dog = screen.getByRole('checkbox', { name: 'Walk dog' }) as HTMLInputElement

    await user.click(milk)
    expect(milk.checked).toBe(true)
    expect(dog.checked).toBe(false)

    await user.click(milk)
    expect(milk.checked).toBe(false)
  })

  it('toggles via clicking the label text', async () => {
    const { user, input } = setup()
    await user.type(input, 'Buy milk{Enter}')
    await user.click(screen.getByText('Buy milk'))
    expect((screen.getByRole('checkbox', { name: 'Buy milk' }) as HTMLInputElement).checked).toBe(true)
  })

  it('gives each delete button an accessible name including the todo text', async () => {
    const { user, input } = setup()
    await user.type(input, 'Buy milk{Enter}')
    expect(screen.getByRole('button', { name: 'Delete Buy milk' })).toBeTruthy()
  })

  it('deletes only the matching todo', async () => {
    const { user, input } = setup()
    await user.type(input, 'Buy milk{Enter}')
    await user.type(input, 'Walk dog{Enter}')
    await user.type(input, 'Write tests{Enter}')

    await user.click(screen.getByRole('button', { name: 'Delete Walk dog' }))
    expect(todoTexts()).toEqual(['Buy milk', 'Write tests'])
    expect(screen.queryByRole('button', { name: 'Delete Walk dog' })).toBeNull()
  })

  it('deletes the correct todo when two todos share the same text', async () => {
    const { user, input } = setup()
    await user.type(input, 'Same{Enter}')
    await user.type(input, 'Same{Enter}')
    const [first] = screen.getAllByRole('checkbox', { name: 'Same' }) as HTMLInputElement[]
    await user.click(first)

    await user.click(screen.getAllByRole('button', { name: 'Delete Same' })[0])
    const remaining = screen.getAllByRole('checkbox', { name: 'Same' }) as HTMLInputElement[]
    expect(remaining).toHaveLength(1)
    expect(remaining[0].checked).toBe(false)
  })
})
