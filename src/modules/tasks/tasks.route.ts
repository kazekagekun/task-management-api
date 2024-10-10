import { FastifyInstance } from 'fastify';
import { $ref } from './tasks.schema';

export default async (fastify: FastifyInstance) => {
	console.log($ref('getTasksParamsSchema'));
	fastify.get(
		'/:id',
		{
			schema: {
				tags: ['Tasks'],
				params: $ref('getTasksParamsSchema'),
				querystring: $ref('getTasksQuerySchema'),
				response: {
					200: $ref('getTasksSchemaResponseSchema'),
				},
			},
		},
		async () => {
			return { hello: 'world' };
		},
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
		async () => {
			return { hello: 'world' };
		},
	);

	fastify.put(
		'/:id',
		{
			schema: {
				tags: ['Tasks'],
				params: $ref('getTasksParamsSchema'),
				body: $ref('updateTaskSchema'),
				response: {
					200: $ref('updateTaskSchemaResponseSchema'),
				},
			},
		},
		async () => {
			return { hello: 'world' };
		},
	);
};
