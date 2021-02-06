import dateFormat from 'dateformat'
import { useHistory } from 'react-router-dom'
import update from 'immutability-helper'
import React, { useEffect, useState } from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Label
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import { Todo } from '../types/Todo'
import { useAuth0 } from '@auth0/auth0-react'

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean
}

export const Todos = () => {
  const [token, setToken] = useState<string>('')
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  const [state, set] = useState<TodosState>({ todos: [], newTodoName: '', loadingTodos: false })
  const { push } = useHistory()

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    set((s) => ({ ...s, newTodoName: event.target.value }))
  }

  const onEditButtonClick = (todoId: string) => {
    push(`/todos/${todoId}/edit`)
  }

  const onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      if (state.newTodoName == "") {
        alert('Please enter todo name')
        return
      }
      const dueDate = calculateDueDate()
      const newTodo = await createTodo(token, {
        name: state.newTodoName,
        dueDate
      })
      set((s) => ({
        ...s,
        todos: [...s.todos, newTodo],
        newTodoName: ''
      }))
    } catch {
      alert('Todo creation failed')
    }
  }

  const onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(token, todoId)
      set((s) => ({
        ...s,
        todos: s.todos.filter(todo => todo.todoId != todoId)
      }))
    } catch {
      alert('Todo deletion failed')
    }
  }

  const onTodoCheck = async (pos: number) => {
    try {
      const todo = state.todos[pos]
      await patchTodo(token, todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      set((s) => ({
        ...s,
        todos: update(state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      }))
    } catch {
      alert('Todo deletion failed')
    }
  }

  useEffect(() => {
    token && (async function() {
        try {
          const todos = await getTodos(token)
          set((s) => ({
            ...s,
            todos: todos,
            loadingTodos: false
          }))
        } catch (e) {
          alert(`Failed to fetch todos: ${e.message}`)
        }
    })()
  }, [token])

  useEffect(() => {
    isAuthenticated && getAccessTokenSilently()
      .then(t => setToken(t))
  }, [isAuthenticated])

  return (
    <div>
      <Header as="h1">TODOs</Header>

      {renderCreateTodoInput()}

      {renderTodos()}
    </div>
  )

  function renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: onTodoCreate
            }}
            fluid
            actionPosition="left"
            value={state.newTodoName}
            placeholder="To change the world..."
            onChange={handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  function renderTodos() {
    if (state.loadingTodos) {
      return renderLoading()
    }

    return renderTodosList()
  }

  function renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  function renderTodosList() {
    return (
      <Grid padded>
        {state && state.todos && state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>

    )
  }

  function calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }

}
