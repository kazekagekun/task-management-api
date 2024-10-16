import { prisma } from '../../plugins/prisma';
import { Prisma, Tasks } from '@prisma/client';

export default class TasksService {
	public async createTask({
		name,
		description,
		dueDate,
		userId,
	}: {
		name: string;
		description: string;
		dueDate: Date;
		userId: number;
	}): Promise<Tasks> {
		const createdTask = await prisma.tasks.create({
			data: {
				userId,
				name,
				description,
				dueDate,
			},
		});

		return createdTask;
	}

	public async updateTask(
		id: string,
		userId: number,
		{
			name,
			description,
			dueDate,
		}: {
			name: string;
			description: string;
			dueDate: Date;
		},
	): Promise<Tasks> {
		const task = await prisma.tasks.findFirst({
			where: {
				id: Number(id),
				userId,
			},
		});

		if (!task) {
			throw new Error('Task not found');
		}

		const updatedTask = await prisma.tasks.update({
			where: {
				id: Number(id),
			},
			data: {
				name,
				description,
				dueDate,
			},
		});

		return updatedTask;
	}

	public async getTask({
		id,
		name,
		page,
		sort,
		order,
		description,
		userId,
	}: {
		userId: number;
		id?: string;
		name?: string;
		description?: string;
		page?: string;
		sort?: string;
		order?: 'asc' | 'desc';
	}): Promise<{
		total: number;
		data: Tasks[];
		pageTotal: number;
	}> {
		const query: Prisma.TasksFindManyArgs = {
			skip: (Number(page) - 1) * 10 || 0,
			take: 10,
			where: {
				id: id ? Number(id) : undefined,
				name: name ? name : undefined,
				description: description ? description : undefined,
				userId: userId,
			},
			orderBy: {
				[sort || 'id']: order || 'asc',
			},
		};

		const [tasks, count] = await prisma.$transaction([
			prisma.tasks.findMany(query),
			prisma.tasks.count({ where: query.where }),
		]);

		return {
			total: count,
			pageTotal: Math.ceil(count / 10),
			data: tasks,
		};
	}
}
