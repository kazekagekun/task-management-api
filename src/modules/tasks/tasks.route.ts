import { FastifyInstance } from 'fastify';
import { $ref } from './tasks.schema';
import TasksController from './tasks.controller';
import TasksService from './tasks.service';
import { CreateTaskBody, GetTasksQuery, UpdateTaskBody, UpdateTaskParams } from './tasks.schema';

export default async (fastify: FastifyInstance) => {
	const taskController = new TasksController(new TasksService());

	fastify.get<{
		Querystring: GetTasksQuery;
	}>(
		'/',
		{
			onRequest: [fastify.authenticate],
			schema: {
				tags: ['Tasks'],
				querystring: $ref('getTasksQuerySchema'),
				response: {
					200: $ref('getTasksSchemaResponseSchema'),
				},
			},
		},
		taskController.getTasksHander.bind(taskController),
	);

	fastify.post<{
		Body: CreateTaskBody;
	}>(
		'/',
		{
			onRequest: [fastify.authenticate],
			schema: {
				tags: ['Tasks'],
				body: $ref('createTaskSchema'),
				response: {
					201: $ref('createTaskSchemaResponseSchema'),
				},
			},
		},
		taskController.createTaskHandler.bind(taskController),
	);

	fastify.put<{
		Params: UpdateTaskParams;
		Body: UpdateTaskBody;
	}>(
		'/:id',
		{
			onRequest: [fastify.authenticate],
			schema: {
				tags: ['Tasks'],
				params: $ref('updateTasksParamsSchema'),
				body: $ref('updateTaskSchema'),
				response: {
					200: $ref('updateTaskSchemaResponseSchema'),
				},
			},
		},
		taskController.updateTaskHandler.bind(taskController),
	);
};
