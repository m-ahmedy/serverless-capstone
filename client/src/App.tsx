import { useAuth0 } from '@auth0/auth0-react'
import React, { Component, useEffect } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'

import { EditTodo } from './components/EditTodo'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Todos } from './components/Todos'

export interface AppProps { }

export interface AppState { }

const App = () => {
  const { loginWithRedirect, logout, isAuthenticated, error } = useAuth0()

  const handleLogin = () => {
    loginWithRedirect()
  }

  const handleLogout = () => {
    logout()
  }

  useEffect(() => {
    console.log(error)
  }, [error])

  return (
    <div>
      <Segment style={{ padding: '8em 0em' }} vertical>
        <Grid container stackable verticalAlign="middle">
          <Grid.Row>
            <Grid.Column width={16}>
              {generateMenu()}
              {generateCurrentPage()}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </div>
  )


  function generateMenu() {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>

        <Menu.Menu position="right">{logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  function logInLogOutButton() {
    if (isAuthenticated) {
      return (
        <Menu.Item name="logout" onClick={handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  function generateCurrentPage() {
    if (!isAuthenticated) {
      return <LogIn />
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          component={Todos}
        />

        <Route
          path="/todos/:todoId/edit"
          exact
          component={EditTodo}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}

export default App