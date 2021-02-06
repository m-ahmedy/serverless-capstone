import { createLogger } from '@libs/logger';
import { CreateTodoRequest } from 'src/requests/create-todo-request';
import { TodosStorage } from 'src/data/dataLayer/todosStorage';
import { TodosAccess } from 'src/data/dataLayer/todosAccess';
import { TodoItem } from 'src/data/models/todo';
import { HttpError } from 'http-errors';
import { UpdateTodoRequest } from 'src/requests/update-todo-request';

const todosAccess = new TodosAccess()
const todosStorage = new TodosStorage()

const logger = createLogger('Todos business logic')

export async function createTodoItem(
    userId: string,
    createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
    logger.info(`create todo for user ${userId} with data ${JSON.stringify(createTodoRequest)}`)

    const item = await todosAccess.createTodo(createTodoRequest, userId)

    logger.info(`created todo for user ${userId} with data ${JSON.stringify(createTodoRequest)} successfully`)

    return item
}

export async function deleteTodoItem(
    userId: string,
    todoId: string
): Promise<void> {
    // get todo item if any
    const item = await todosAccess.getTodoById(todoId)

    // validate todo already exists
    if (item.Count == 0) {
        logger.error(`user ${userId} requesting delete for non exists todo with id ${todoId}`)
        throw {
            statusCode: 404,
            message: JSON.stringify({ message: `Todo item does not exist` }),
        } as HttpError
    }

    // validate todo belong to authorized user
    if (item.Items[0].userId !== userId) {
        logger.error(`user ${userId} requesting delete todo does not belong to his account with id ${todoId}`)
        throw {
            statusCode: 401,
            message: JSON.stringify({ message: `User does not have permission to delete this Todo` })
        } as HttpError
    }
    logger.info(`User ${userId} deleting todo ${todoId}`)

    // Delete todo record
    await todosAccess.deleteTodoById(todoId)
}

export async function generateUploadUrl(
    userId: string,
    todoId: string
): Promise<string> {
    // get todo item if any
    const item = await todosAccess.getTodoById(todoId)

    // validate todo already exists
    if (item.Count == 0) {
        logger.error(`user ${userId} requesting delete for non exists todo with id ${todoId}`)
        throw {
            statusCode: 404,
            message: JSON.stringify({ message: `Todo item does not exist` }),
        } as HttpError
    }

    // validate todo belong to authorized user
    if (item.Items[0].userId !== userId) {
        logger.error(`user ${userId} requesting delete todo does not belong to his account with id ${todoId}`)
        throw {
            statusCode: 401,
            message: JSON.stringify({ message: `User does not have permission to delete this Todo` })
        } as HttpError
    }

    // Generate S3 pre-signed url for this todo
    const url = todosStorage.getPresignedUrl(todoId)

    return url
}

export async function getUserTodoItems(
    userId: string
): Promise<TodoItem[]> {
    logger.info(`get todos for user ${userId}`)

    // Get user's Todos
    const result = await todosAccess.getUserTodos(userId)

    // Generate todos pre-signed get url for todos with uploaded images
    for (const record of result) {
        if (record.hasImage) {
            record.attachmentUrl = await todosStorage.getTodoAttachmentUrl(record.todoId)
        }
    }

    return result
}

export async function updateTodoItem(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
): Promise<void> {
    // get todo item if any
    const item = await todosAccess.getTodoById(todoId)

    // validate todo already exists
    if (item.Count == 0) {
        logger.error(`user ${userId} requesting delete for non exists todo with id ${todoId}`)
        throw {
            statusCode: 404,
            message: JSON.stringify({ message: `Todo item does not exist` }),
        } as HttpError
    }

    // validate todo belong to authorized user
    if (item.Items[0].userId !== userId) {
        logger.error(`user ${userId} requesting delete todo does not belong to his account with id ${todoId}`)
        throw {
            statusCode: 401,
            message: JSON.stringify({ message: `User does not have permission to delete this Todo` })
        } as HttpError
    }

    logger.info(`User ${userId} updating todo ${todoId} to be ${updateTodoRequest}`)

    // update todo 
    await todosAccess.updateTodo(updateTodoRequest, todoId)
}