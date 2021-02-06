import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from 'src/requests/create-todo-request'
import { AuthHelper } from '@libs/auth'
import { createLogger } from '@libs/logger'

import { createTodoItem } from 'src/bussinessLogic/todos'
import { HttpError } from 'http-errors'

import middy from '@middy/core'
import cors from '@middy/http-cors'

const logger = createLogger('todos')
const authHelper = new AuthHelper()

/**
 * Create new Todo Item
 * @param event API gateway event
 */
const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event: ${JSON.stringify(event)}`)

    // parse todo field from event body
    const createTodoRequest: CreateTodoRequest = JSON.parse(event.body)

    // get user id using JWT from Authorization header
    const userId = authHelper.getUserId(event.headers['Authorization'])

    try {
        const item = await createTodoItem(userId, createTodoRequest)
        // return success response                            
        return {
            statusCode: 201,
            body: JSON.stringify({ item, })
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
