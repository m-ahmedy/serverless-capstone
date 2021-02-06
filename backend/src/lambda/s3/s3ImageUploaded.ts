import 'source-map-support/register'
import { S3Event, S3Handler } from 'aws-lambda'
import { TodosAccess } from '../../data/dataLayer/todosAccess'
import { createLogger } from '@libs/logger'
import { TodoItem } from 'src/data/models/todo'

const logger = createLogger('Todos Bucket')
const todosAccess = new TodosAccess()

/**
 * Get authorized user todos list
 * @param event API gateway Event
 */
export const handler: S3Handler = async (event: S3Event): Promise<void> => {
    const fileName = event.Records[0].s3.object.key
    logger.info(`File uploaded ${fileName}`)

    const todoId = fileName.split('.')[0]
    const item = await todosAccess.getTodoById(todoId)

    if (item.Count == 1) {
        const { userId } = item.Items[0] as unknown as TodoItem
        await todosAccess.updateTodoImageFlag(todoId, userId)
    } else {
        logger.error(`File uploaded ${fileName} not matching a todo`)
    }
}