import * as React from 'react'
import { Button } from 'semantic-ui-react'
import { useAuth0 } from '@auth0/auth0-react'

export const LogIn = () => {
  const { loginWithRedirect } = useAuth0()
  const onLogin = () => {
    loginWithRedirect()
  }
  return (
    <div>
      <h1>Please log in</h1>

      <Button onClick={onLogin} size="huge" color="olive">
        Log in
        </Button>
    </div>
  )
}
