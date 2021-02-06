import { Jwt } from '../auth/Jwt'
import { decode } from 'jsonwebtoken'


/**
 * Authorization helper
 * for common Authorization functions
 */
export class AuthHelper {

    /**
     * Decode JWT and return User Id (sub)
     * @param authHeader Authorization Header
     */
    getUserId(authHeader: string): string {
        const token = this.getToken(authHeader)
        const jwt: Jwt = decode(token, { complete: true }) as Jwt
        return jwt.payload.sub
    }



    /**
     * extract JWT from authorization header
     * @param authHeader Authorization Header
     */
    getToken(authHeader: string): string {
        if (!authHeader)
            throw new Error('No authentication header')

        if (!authHeader.toLowerCase().startsWith('bearer '))
            throw new Error('Invalid authentication header')

        const split = authHeader.split(' ')
        const token = split[1]

        return token
    }

}