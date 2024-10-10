import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';
import { responseEnvelopeSchema } from '../../utils/schema';

const taskCore = {
	name: z.string().min(1).max(255),
	description: z.string().min(1).max(500),
	dueDate: z.date(),
};

const createTaskSchema = z.object({
	...taskCore,
});

const createTaskSchemaResponseSchema = z.object({
	...responseEnvelopeSchema,
	data: z.object({
		...taskCore,
	}),
});

const getTasksQuerySchema = z.object({
	name: z.string().optional(),
});

const getTasksParamsSchema = z.object({
	id: z.string().optional(),
});

const getTasksSchemaResponseSchema = z.object({
	...responseEnvelopeSchema,
	data: z.array(
		z.object({
			...taskCore,
		}),
	),
});

const updateTaskSchema = z.object({
	...taskCore,
});

const updateTaskSchemaResponseSchema = z.object({
	...responseEnvelopeSchema,
	data: z.object({
		...taskCore,
	}),
});

export type CreateTaskBody = z.infer<typeof createTaskSchema>;

export type GetTasksParams = z.infer<typeof getTasksParamsSchema>;

export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>;

export type UpdateTaskBody = z.infer<typeof getTasksSchemaResponseSchema>;

export type UpdateTaskParams = z.infer<typeof getTasksParamsSchema>;

export type UpdateTaskResponse = z.infer<typeof updateTaskSchemaResponseSchema>;

export const { schemas: tasksSchema, $ref } = buildJsonSchemas(
	{
		createTaskSchema,
		createTaskSchemaResponseSchema,
		getTasksQuerySchema,
		getTasksParamsSchema,
		getTasksSchemaResponseSchema,
		updateTaskSchema,
		updateTaskSchemaResponseSchema,
	},
	{
		$id: 'tasksSchema',
	},
);
