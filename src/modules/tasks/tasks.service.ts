import { prisma } from '../../plugins/prisma';
import { Tasks } from '@prisma/client';

export default class TasksService {
	public async createTask({
        name,
        description,
        dueDate
    }: {
        name: string;
        description: string;
        dueDate: Date;
    }): Promise<Tasks>{
        const createdTask = await prisma.tasks.create({
            data: {
                userId: 1,
                name,
                description,
                dueDate
            }
        });        

        return createdTask;
	}

    public async updateTask(id: string, {
        name,
        description,
        dueDate
    }: {
        name: string;
        description: string;
        dueDate: Date;
    }): Promise<Tasks>{
        const updatedTask = await prisma.tasks.update({
            where: {
                id: Number(id)
            },
            data: {
                name,
                description,
                dueDate
            }
        });

        return updatedTask;
    }

    public async getTask({
        id,
        name
    }: {
        id?: string;
        name?: string;
    }): Promise<Tasks[]>{
        const task = await prisma.tasks.findMany({
            where: {
                id: id ? Number(id) : undefined,
                name: name ? name : undefined
            }
        });

        return task;
    }
}
