import * as AWS from 'aws-sdk'
import { TodoItem } from '../models/todo'
import { CreateTodoRequest } from 'src/requests/create-todo-request'
import { UpdateTodoRequest } from 'src/requests/update-todo-request'

const uuid = require('uuid/v4')

/**
 * Todos database access for Todo's CRUD operations
 */
export class TodosAccess {
    constructor(
        private readonly docClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    ) { }

    /**
     * Get authorized user todos list
     * @param userId Authorized user id
     */
    async getUserTodos(userId: string): Promise<TodoItem[]> {
        const param = {
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            Limit: 5
        }

        const dataResult = await this.docClient
            .query(param)
            .promise()
        return dataResult.Items as TodoItem[]
    }

    /**
     * Create new Todo Item
     * @param request Create todo data
     * @param userId Logged user id
     */
    async createTodo(request: CreateTodoRequest, userId: string): Promise<TodoItem> {
        const item: TodoItem = {
            userId: userId,
            todoId: uuid(),
            createdAt: new Date().toISOString(),
            name: request.name,
            dueDate: request.dueDate,
            done: false,
            hasImage: false
        }
        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise()
        return item
    }


    /**
     * Get Todo record by Id
     * @param id Todo Id
     */
    async getTodoById(todoId: string): Promise<AWS.DynamoDB.QueryOutput> {
        return await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
            }
        }).promise()
    }

    async updateTodoImageFlag(todoId: string, userId: string) {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                'todoId': todoId,
                'userId': userId
            },
            UpdateExpression: 'set  hasImage = :t',
            ExpressionAttributeValues: {
                ':t': true
            }
        }).promise()
    }

    /**
     * Update existing Todo record
     * @param updatedTodo Update field details
     * @param todoId Todo Id
     */
    async updateTodo(updatedTodo: UpdateTodoRequest, todoId: string, userId: string) {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                'todoId': todoId,
                'userId': userId
            },
            UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
            ExpressionAttributeValues: {
                ':n': updatedTodo.name,
                ':d': updatedTodo.dueDate,
                ':done': updatedTodo.done
            },
            ExpressionAttributeNames: {
                '#namefield': 'name'
            }
        }).promise()
    }


    /**
     * Delete Todo record
     * @param todoId Todo Id
     */
    async deleteTodoByKey(todoId: string, userId: string) {
        const param = {
            TableName: this.todosTable,
            Key: {
                'todoId': todoId,
                'userId': userId
            }
        }
        await this.docClient.delete(param).promise()
    }

}