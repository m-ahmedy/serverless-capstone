import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '@libs/logger'
import { AuthHelper } from '@libs/auth'
import { getUserTodoItems } from 'src/bussinessLogic/todos'

import middy from '@middy/core'
import cors from '@middy/http-cors'
import { HttpError } from 'http-errors'

const logger = createLogger('todos')
const authHelper = new AuthHelper()

/**
 * Get authorized user todos list
 * @param event API gateway Event
 */
const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event: ${JSON.stringify(event)}`)

    // get user id using JWT from Authorization header
    const userId = authHelper.getUserId(event.headers['Authorization'])

    try {
        const items = await getUserTodoItems(userId)

        // return success response
        return {
            statusCode: 200,
            body: JSON.stringify({ items, }),
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
