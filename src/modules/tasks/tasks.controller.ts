import { FastifyReply, FastifyRequest } from 'fastify';
import TasksService from './tasks.service';
import { CreateTaskBody, GetTasksQuery, UpdateTaskBody, UpdateTaskParams } from './tasks.schema';

export default class TasksController {

    private tasksService: TasksService;

	constructor(tasksService: TasksService) {
		this.tasksService = tasksService;
	}

	public async createTaskHandler(
		request: FastifyRequest<{
			Body: CreateTaskBody;
		}>,
		reply: FastifyReply,
	) {
		try {
			const task = await this.tasksService.createTask(request.body);

			return reply.code(201).send({
                success: true,
                data: task,
            });
		} catch (e) {
			if (e instanceof Error) {
				return reply.badRequest(e.message);
			}

			throw e;
		}
	}

	public async getTasksHander(
		request: FastifyRequest<{
			Querystring: GetTasksQuery;
		}>,
		reply: FastifyReply,
	) {
		try {
			const tasks = await this.tasksService.getTask(request.query);

			return reply
				.code(200)
				.send({
                    success: true,
                    data: tasks,
				});
		} catch (e) {

			if (e instanceof Error) {
				return reply.badRequest(e.message);
			}

            throw e;
		}
	}

	public async updateTaskHandler(request: FastifyRequest<{
        Body: UpdateTaskBody;
        Params: UpdateTaskParams;
    }>, reply: FastifyReply) {
		try {
            console.log(request.params);
            const task = await this.tasksService.updateTask(request.params.id, request.body);

			return reply
				.code(200)
                .send({
                    success: true,
                    data: task,
                });
		} catch (e) {
			if (e instanceof Error) {
				return reply.badRequest(e.message);
			}

            throw e;
		}
	}


}
