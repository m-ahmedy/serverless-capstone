import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { AuthHelper } from '@libs/auth'
import { createLogger } from '@libs/logger'
import { deleteTodoItem } from 'src/bussinessLogic/todos'
import { HttpError } from 'http-errors'

import middy from '@middy/core'
import cors from '@middy/http-cors'

const logger = createLogger('todos')
const authHelper = new AuthHelper()

/**
 * Delete existing todo item belong to authorized user
 * @param event API gateway event
 */
const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event: ${JSON.stringify(event)}`)

    // get todo id from path parameters
    const todoId = event.pathParameters.todoId

    // get user id using JWT from Authorization header
    const userId = authHelper.getUserId(event.headers['Authorization'])

    try {
        await deleteTodoItem(userId, todoId)
        // return success response                            
        return {
            statusCode: 204,
            body: '',
        }
    } catch (e) {
        const { message, statusCode } = e as HttpError
        return {
            statusCode,
            body: JSON.stringify({ message, }),
        }
    }
}

export const handler = middy(main).use(cors({ credentials: true }))
