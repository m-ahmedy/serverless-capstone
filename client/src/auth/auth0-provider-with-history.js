import React from 'react'
import { useHistory } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import { auth0Config } from '../config.ts'

const Auth0ProviderWithHistory = ({ children }) => {
    const { clientId, domain, audience } = auth0Config

    const history = useHistory()

    const onRedirectCallback = (appState) => {
        history.push(appState?.returnTo || window.location.pathname)
    }

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            audience={audience}
            redirectUri={window.location.origin}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    )
}

export default Auth0ProviderWithHistory