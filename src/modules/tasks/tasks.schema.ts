import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';
import { responseEnvelopeSchema } from '../../utils/schema';

const taskCore = {
	id: z.string().optional(),
	name: z.string().min(1).max(255),
	description: z.string().min(1).max(500),
	dueDate: z.date(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	userId: z.string().optional(),
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
	page: z.string().optional(),
	name: z.string().optional(),
	id: z.string().optional(),
	sort: z.string().optional(),
	order: z.enum(['asc', 'desc']).optional(),
});

const updateTasksParamsSchema = z.object({
	id: z.string(),
});

const getTasksSchemaResponseSchema = z.object({
	...responseEnvelopeSchema,
	data: z.object({
		total: z.number(),
		pageTotal: z.number(),
		data: z.array(
			z.object({
				...taskCore,
			}),
		),
	}),
});

const updateTaskSchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().min(1).max(500),
	dueDate: z.date(),
});

const updateTaskSchemaResponseSchema = z.object({
	...responseEnvelopeSchema,
	data: z.object({
		...taskCore,
	}),
});

export type CreateTaskBody = z.infer<typeof createTaskSchema>;

export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>;

export type UpdateTaskBody = z.infer<typeof updateTaskSchema>;

export type UpdateTaskParams = z.infer<typeof updateTasksParamsSchema>;

export type UpdateTaskResponse = z.infer<typeof updateTaskSchemaResponseSchema>;

export const { schemas: tasksSchema, $ref } = buildJsonSchemas(
	{
		createTaskSchema,
		createTaskSchemaResponseSchema,
		getTasksQuerySchema,
		getTasksSchemaResponseSchema,
		updateTaskSchema,
		updateTasksParamsSchema,
		updateTaskSchemaResponseSchema,
	},
	{
		$id: 'tasksSchema',
	},
);
