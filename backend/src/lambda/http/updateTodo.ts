import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { AuthHelper } from '@libs/auth'
import { UpdateTodoRequest } from 'src/requests/update-todo-request'
import { updateTodoItem } from 'src/bussinessLogic/todos'
import { HttpError } from 'http-errors'

import middy from '@middy/core'
import cors from '@middy/http-cors'

const authHelper = new AuthHelper()

/**
 * Update existing todo belong to authorized user
 * @param event API getway event
 */
const main: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
    // get todo id from path parameters
    const todoId = event.pathParameters.todoId

    //Extract update fields from event body
    const updateTodoRequest: UpdateTodoRequest = JSON.parse(event.body)
    
    // get user id using JWT from Authorization header
    const userId = authHelper.getUserId(event.headers['Authorization'])
  
    try {
        await updateTodoItem(userId, todoId, updateTodoRequest)
        // return success response                            
        return {
            statusCode: 204,
            body: ''
        }
    } catch (e) {
        const { message, statusCode } = e as HttpError
        return {
            statusCode,
            body: JSON.stringify({ message, })
        }
    }
}

export const handler = middy(main).use(cors({ credentials: true }))
