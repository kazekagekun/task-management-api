import { FastifyInstance } from 'fastify';
import { $ref } from './tasks.schema';
import TasksController from './tasks.controller';
import TasksService from './tasks.service';

export default async (fastify: FastifyInstance) => {
	const taskController = new TasksController(new TasksService());

	fastify.get(
		'/',
		{
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

	fastify.post(
		'/',
		{
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

	fastify.put(
		'/:id',
		{
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
