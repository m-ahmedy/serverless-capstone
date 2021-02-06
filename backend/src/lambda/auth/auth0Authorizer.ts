import 'source-map-support/register'
import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda'

import { createLogger } from '@libs/logger'
import jwksClient from 'jwks-rsa'
import util from 'util'
import jwt from 'jsonwebtoken'

const logger = createLogger('Authorizer')

const jwksUrl = process.env.AUTH_0_JWKS_URL
const auth0Audience = process.env.AUTH_0_AUDIENCE
const auth0Issuer = process.env.AUTH_0_ISSUER

export const handler = async (
    event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
    const { authorizationToken } = event
    logger.info(`Authorizing a user ${authorizationToken}`)

    try {
        const decoded = await verifyToken(authorizationToken)
        logger.info(`User was authorized ${JSON.stringify(decoded)}`)

        return {
            principalId: decoded['sub'],
            policyDocument: getPolicyDocument('Allow'),
            context: { scope: decoded['scope'] }
        }
    } catch (e) {
        logger.error(`User not authorized ${JSON.stringify({ error: e.message })}`)

        return {
            principalId: 'user',
            policyDocument: getPolicyDocument('Deny')
        }
    }
}

const getPolicyDocument = (effect) => {
    const policyDocument = {
        Version: '2012-10-17', // default version
        Statement: [{
            Action: 'execute-api:Invoke', // default action
            Effect: effect,
            Resource: '*',
        }]
    }
    return policyDocument
}

// extract and return the Bearer Token from the Lambda event parameters
const getToken = (tokenString: string) => {
    if (!tokenString) {
        throw new Error('Expected Authorization header to be set')
    }

    const match = tokenString.match(/^Bearer (.*)$/)
    if (!match || match.length < 2) {
        throw new Error(`Invalid Authorization token - ${tokenString} does not match "Bearer .*"`)
    }
    return match[1]
}

const verifyToken = (authHeader: string) => {
    const token = getToken(authHeader)

    const decoded = jwt.decode(token, { complete: true })
    if (!decoded || !decoded['header'] || !decoded['header'].kid) {
        throw new Error('invalid token')
    }

    const getSigningKey = util.promisify(client.getSigningKey)

    logger.info(`Fetching key from ${jwksUrl}`)

    return getSigningKey(decoded['header'].kid)
        .then((key: any) => {
            logger.info(`Valid key found ${key}`)
            const signingKey = key.publicKey || key.rsaPublicKey

            logger.info(`Verifying token ${token}`)
            return jwt.verify(token, signingKey, jwtOptions)
        })
}

const jwtOptions = {
    audience: auth0Audience,
    issuer: auth0Issuer
}

const client = jwksClient({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10, // Default value
    jwksUri: jwksUrl
})
