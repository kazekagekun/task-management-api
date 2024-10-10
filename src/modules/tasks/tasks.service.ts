import { prisma } from '../../plugins/prisma';
import { Prisma, Tasks } from '@prisma/client';

export default class TasksService {
	public async createTask({
		name,
		description,
		dueDate,
	}: {
		name: string;
		description: string;
		dueDate: Date;
	}): Promise<Tasks> {
		const createdTask = await prisma.tasks.create({
			data: {
				userId: 1,
				name,
				description,
				dueDate,
			},
		});

		return createdTask;
	}

	public async updateTask(
		id: string,
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
		skip,
		sort,
		order,
	}: {
		id?: string;
		name?: string;
		skip?: string;
		sort?: string;
		order?: 'asc' | 'desc';
	}): Promise<{
		total: number;
		data: Tasks[];
	}> {
		const query: Prisma.TasksFindManyArgs = {
			skip: Number(skip) || 0,
			take: 10,
			where: {
				id: id ? Number(id) : undefined,
				name: name ? name : undefined,
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
			data: tasks,
		};
	}
}
