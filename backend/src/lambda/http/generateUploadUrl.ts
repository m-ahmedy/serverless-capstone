import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { AuthHelper } from '@libs/auth'
import { createLogger } from '@libs/logger'
import { generateUploadUrl } from 'src/bussinessLogic/todos';
import { HttpError } from 'http-errors';

import middy from '@middy/core'
import cors from '@middy/http-cors'

const logger = createLogger('todos')
const authHelper = new AuthHelper()


/**
 * Generate upload pre-signed url for todo image upload
 * @param event API getway Event
 */
const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing event: ${JSON.stringify(event)}`)

    // get todo id from path parameters
    const todoId = event.pathParameters.todoId

    // get user id using JWT from Authorization header
    const userId = authHelper.getUserId(event.headers['Authorization'])

    try {
        const url = await generateUploadUrl(userId, todoId)
        // return success response                            
        return {
            statusCode: 201,
            body: JSON.stringify({ url, }),
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
