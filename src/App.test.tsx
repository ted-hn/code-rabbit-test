import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('initial render', () => {
  it('renders the app header', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My Tasks')
  })

  it('renders the text input with placeholder', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument()
  })

  it('renders an Add button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('renders All, Active, and Completed filter buttons', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Completed' })).toBeInTheDocument()
  })

  it('shows the empty-state message when there are no todos', () => {
    render(<App />)
    expect(screen.getByText(/No tasks here yet/i)).toBeInTheDocument()
  })

  it('shows "0 tasks left" in the footer initially', () => {
    render(<App />)
    expect(screen.getByText(/0 tasks left/i)).toBeInTheDocument()
  })

  it('All filter button has the "active" class by default', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'All' })).toHaveClass('active')
    expect(screen.getByRole('button', { name: 'Active' })).not.toHaveClass('active')
    expect(screen.getByRole('button', { name: 'Completed' })).not.toHaveClass('active')
  })

  it('"Clear completed" button is disabled when no todos exist', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Clear completed/i })).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Adding todos
// ---------------------------------------------------------------------------

describe('adding todos', () => {
  it('adds a todo when the Add button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Buy milk')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('adds a todo when Enter is pressed in the input', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Read a book{Enter}')

    expect(screen.getByText('Read a book')).toBeInTheDocument()
  })

  it('clears the input field after a todo is added', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Walk the dog{Enter}')

    expect(input).toHaveValue('')
  })

  it('does not add a todo when input is empty', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByText(/No tasks here yet/i)).toBeInTheDocument()
  })

  it('does not add a todo when input contains only whitespace', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), '   ')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('trims leading/trailing whitespace from added todo text', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), '  Trimmed task  ')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByText('Trimmed task')).toBeInTheDocument()
  })

  it('allows adding multiple todos', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'First{Enter}')
    await user.type(input, 'Second{Enter}')

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Toggling todos
// ---------------------------------------------------------------------------

describe('toggling todos', () => {
  it('marks a todo as completed when its checkbox is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Task A{Enter}')
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(checkbox).toBeChecked()
  })

  it('adds the "done" CSS class to a completed todo item', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Task B{Enter}')
    await user.click(screen.getByRole('checkbox'))

    const listItem = screen.getByRole('listitem', { name: undefined })
    // The li wrapping the todo should have class "done"
    expect(listItem).toHaveClass('done')
  })

  it('un-marks a completed todo when its checkbox is clicked again', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Task C{Enter}')
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox) // complete
    await user.click(checkbox) // un-complete

    expect(checkbox).not.toBeChecked()
  })

  it('only toggles the target todo, leaving others unaffected', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'First{Enter}')
    await user.type(input, 'Second{Enter}')

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).not.toBeChecked()
  })
})

// ---------------------------------------------------------------------------
// Deleting todos
// ---------------------------------------------------------------------------

describe('deleting todos', () => {
  it('removes a todo when its delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Delete me{Enter}')
    await user.click(screen.getByRole('button', { name: /Delete task/i }))

    expect(screen.queryByText('Delete me')).not.toBeInTheDocument()
    expect(screen.getByText(/No tasks here yet/i)).toBeInTheDocument()
  })

  it('only deletes the target todo when multiple exist', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Keep me{Enter}')
    await user.type(input, 'Remove me{Enter}')

    const deleteButtons = screen.getAllByRole('button', { name: /Delete task/i })
    await user.click(deleteButtons[1])

    expect(screen.getByText('Keep me')).toBeInTheDocument()
    expect(screen.queryByText('Remove me')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

describe('filtering todos', () => {
  async function setupWithTodos() {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Active task{Enter}')
    await user.type(input, 'Completed task{Enter}')

    // Complete the second todo
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1])

    return user
  }

  it('All filter shows all todos', async () => {
    await setupWithTodos()

    expect(screen.getByText('Active task')).toBeInTheDocument()
    expect(screen.getByText('Completed task')).toBeInTheDocument()
  })

  it('Active filter shows only incomplete todos', async () => {
    const user = await setupWithTodos()

    await user.click(screen.getByRole('button', { name: 'Active' }))

    expect(screen.getByText('Active task')).toBeInTheDocument()
    expect(screen.queryByText('Completed task')).not.toBeInTheDocument()
  })

  it('Completed filter shows only completed todos', async () => {
    const user = await setupWithTodos()

    await user.click(screen.getByRole('button', { name: 'Completed' }))

    expect(screen.queryByText('Active task')).not.toBeInTheDocument()
    expect(screen.getByText('Completed task')).toBeInTheDocument()
  })

  it('active filter button gets "active" CSS class when selected', async () => {
    const user = await setupWithTodos()

    await user.click(screen.getByRole('button', { name: 'Active' }))

    expect(screen.getByRole('button', { name: 'Active' })).toHaveClass('active')
    expect(screen.getByRole('button', { name: 'All' })).not.toHaveClass('active')
  })

  it('shows empty-state message when Active filter has no results', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Only task{Enter}')
    await user.click(screen.getByRole('checkbox')) // complete it

    await user.click(screen.getByRole('button', { name: 'Active' }))

    expect(screen.getByText(/No tasks here yet/i)).toBeInTheDocument()
  })

  it('shows empty-state message when Completed filter has no results', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Only task{Enter}')

    await user.click(screen.getByRole('button', { name: 'Completed' }))

    expect(screen.getByText(/No tasks here yet/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Clear completed
// ---------------------------------------------------------------------------

describe('clear completed', () => {
  it('removes all completed todos when "Clear completed" is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Keep me{Enter}')
    await user.type(input, 'Remove me{Enter}')

    await user.click(screen.getAllByRole('checkbox')[1]) // complete second
    await user.click(screen.getByRole('button', { name: /Clear completed/i }))

    expect(screen.getByText('Keep me')).toBeInTheDocument()
    expect(screen.queryByText('Remove me')).not.toBeInTheDocument()
  })

  it('"Clear completed" is enabled when at least one todo is completed', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Task{Enter}')
    await user.click(screen.getByRole('checkbox'))

    expect(screen.getByRole('button', { name: /Clear completed/i })).not.toBeDisabled()
  })

  it('"Clear completed" is disabled when no todos are completed', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Task{Enter}')

    expect(screen.getByRole('button', { name: /Clear completed/i })).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Remaining count
// ---------------------------------------------------------------------------

describe('remaining tasks count', () => {
  it('shows "1 task left" (singular) when exactly one task is incomplete', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Single{Enter}')

    expect(screen.getByText(/1 task left/i)).toBeInTheDocument()
  })

  it('shows "2 tasks left" (plural) when multiple tasks are incomplete', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'One{Enter}')
    await user.type(input, 'Two{Enter}')

    expect(screen.getByText(/2 tasks left/i)).toBeInTheDocument()
  })

  it('decrements the count when a todo is marked completed', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'One{Enter}')
    await user.type(input, 'Two{Enter}')

    await user.click(screen.getAllByRole('checkbox')[0])

    expect(screen.getByText(/1 task left/i)).toBeInTheDocument()
  })

  it('count is based on incomplete todos only, not the active filter', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'One{Enter}')
    await user.type(input, 'Two{Enter}')
    await user.click(screen.getAllByRole('checkbox')[0]) // complete first

    // Switch to Completed filter — footer should still show 1 incomplete
    await user.click(screen.getByRole('button', { name: 'Completed' }))
    expect(screen.getByText(/1 task left/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

describe('localStorage persistence', () => {
  it('persists todos to localStorage when a todo is added', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Persisted{Enter}')

    const stored = JSON.parse(localStorage.getItem('todos') ?? '[]') as Array<{ text: string }>
    expect(stored).toHaveLength(1)
    expect(stored[0].text).toBe('Persisted')
  })

  it('loads todos from localStorage on initial render', () => {
    const seed = [
      { id: 'abc', text: 'Loaded from storage', completed: false, createdAt: Date.now() },
    ]
    localStorage.setItem('todos', JSON.stringify(seed))

    render(<App />)

    expect(screen.getByText('Loaded from storage')).toBeInTheDocument()
  })

  it('loads completed state from localStorage', () => {
    const seed = [
      { id: 'abc', text: 'Done task', completed: true, createdAt: Date.now() },
    ]
    localStorage.setItem('todos', JSON.stringify(seed))

    render(<App />)

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('falls back to an empty list when localStorage contains invalid JSON', () => {
    localStorage.setItem('todos', 'not-valid-json{{{')

    render(<App />)

    expect(screen.getByText(/No tasks here yet/i)).toBeInTheDocument()
  })

  it('persists toggle state to localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Toggle me{Enter}')
    await user.click(screen.getByRole('checkbox'))

    const stored = JSON.parse(localStorage.getItem('todos') ?? '[]') as Array<{ completed: boolean }>
    expect(stored[0].completed).toBe(true)
  })

  it('removes deleted todo from localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Bye{Enter}')
    await user.click(screen.getByRole('button', { name: /Delete task/i }))

    const stored = JSON.parse(localStorage.getItem('todos') ?? '[]') as unknown[]
    expect(stored).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Accessibility / structure
// ---------------------------------------------------------------------------

describe('accessibility and structure', () => {
  it('delete buttons have accessible aria-label "Delete task"', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'A task{Enter}')

    expect(screen.getByRole('button', { name: 'Delete task' })).toBeInTheDocument()
  })

  it('todo list is rendered as a <ul> element', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'List item{Enter}')

    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('todo items are wrapped in <li> elements', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Item 1{Enter}')
    await user.type(input, 'Item 2{Enter}')

    expect(screen.getAllByRole('listitem').filter((el) => el.className.includes('todo-item'))).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// Regression / boundary tests
// ---------------------------------------------------------------------------

describe('regression and boundary cases', () => {
  it('handles pressing Enter on an empty input without error', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('What needs to be done?'), '{Enter}')

    expect(screen.getByText(/No tasks here yet/i)).toBeInTheDocument()
  })

  it('can handle a large number of todos without crashing', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('What needs to be done?')
    for (let i = 1; i <= 20; i++) {
      await user.type(input, `Task ${i}{Enter}`)
    }

    expect(screen.getAllByRole('checkbox')).toHaveLength(20)
  })

  it('remaining count stays accurate after clear completed removes multiple todos', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Stay{Enter}')
    await user.type(input, 'Go 1{Enter}')
    await user.type(input, 'Go 2{Enter}')

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1])
    await user.click(checkboxes[2])

    await user.click(screen.getByRole('button', { name: /Clear completed/i }))

    expect(screen.getByText(/1 task left/i)).toBeInTheDocument()
  })

  it('todo text is displayed exactly as entered (no mutation)', async () => {
    const user = userEvent.setup()
    render(<App />)

    const rawText = 'Hello <World> & "Test"'
    await user.type(screen.getByPlaceholderText('What needs to be done?'), `${rawText}{Enter}`)

    expect(screen.getByText(rawText)).toBeInTheDocument()
  })

  it('filter selection persists across adding new todos', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Active' }))

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'New active task{Enter}')

    // Still on Active filter; new incomplete task should appear
    expect(screen.getByText('New active task')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Active' })).toHaveClass('active')
  })

  it('within() can locate the delete button within a specific todo item', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Alpha{Enter}')
    await user.type(input, 'Beta{Enter}')

    // Find Alpha's list item and click only its delete button
    const items = screen.getAllByRole('listitem').filter((el) => el.className.includes('todo-item'))
    const alphaItem = items.find((el) => within(el).queryByText('Alpha'))!
    await user.click(within(alphaItem).getByRole('button', { name: /Delete task/i }))

    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })
})