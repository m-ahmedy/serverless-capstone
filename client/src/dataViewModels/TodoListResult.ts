import { Todo } from '../types/Todo'

export interface TodoListResult {
    data: Todo[]
    lastId?: object
}