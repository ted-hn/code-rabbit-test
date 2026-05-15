import { useEffect, useState } from 'react'
import './App.css'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

type Filter = 'all' | 'active' | 'completed'

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const saved = localStorage.getItem('todos')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const handleAdd = () => {
    const text = input.trim()
    if (!text) return
    setTodos([
      ...todos,
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: Date.now(),
      },
    ])
    setInput('')
  }

  const handleToggle = (id: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const handleDelete = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id))
  }

  const handleClearCompleted = () => {
    setTodos(todos.filter((t) => !t.completed))
  }

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const remaining = todos.filter((t) => !t.completed).length

  return (
    <div className="todo-app">
      <header className="todo-header">
        <h1>✨ My Tasks ✨</h1>
        <p className="subtitle">Stay productive, one task at a time</p>
      </header>

      <div className="todo-input-row">
        <input
          type="text"
          className="todo-input"
          placeholder="What needs to be done?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
          }}
        />
        <button type="button" className="todo-add" onClick={handleAdd}>
          Add
        </button>
      </div>

      <div className="todo-filters">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`todo-filter ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <ul className="todo-list">
        {filtered.length === 0 && (
          <li className="todo-empty">No tasks here yet. Add one above! 🚀</li>
        )}
        {filtered.map((todo) => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'done' : ''}`}>
            <label className="todo-label">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id)}
              />
              <span className="todo-text">{todo.text}</span>
            </label>
            <button
              type="button"
              className="todo-delete"
              onClick={() => handleDelete(todo.id)}
              aria-label="Delete task"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <footer className="todo-footer">
        <span>
          {remaining} {remaining === 1 ? 'task' : 'tasks'} left
        </span>
        <button
          type="button"
          className="todo-clear"
          onClick={handleClearCompleted}
          disabled={todos.every((t) => !t.completed)}
        >
          Clear completed
        </button>
      </footer>
    </div>
  )
}

export default App
