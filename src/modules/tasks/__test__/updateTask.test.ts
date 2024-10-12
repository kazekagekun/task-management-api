import { prisma } from '../../../plugins/prisma';
// Register your routes and plugins here
// Example: fastify.register(require('./your-routes-file'));

describe('PUT /api/tasks/:id', () => {
	let taskId: number;

	beforeAll(async () => {
		await prisma.user.create({
			data: {
				name: 'Test User',
				email: 'test@test.com',
				password: 'password',
			},
		});
		// Seed the database with a task
		const task = await prisma.tasks.create({
			data: {
				name: 'Initial Task',
				description: 'Initial Description',
				dueDate: new Date(),
				userId: 1,
			},
		});
		taskId = task.id;
	});

	afterAll(async () => {
		// Clean up the database
		await prisma.tasks.deleteMany({});
	});

	it('should update the task', async () => {
		const updatedTask = {
			name: 'Updated Task',
			description: 'Updated Description',
			dueDate: new Date().toISOString(),
		};

		const response = await fastify.inject({
			method: 'PUT',
			url: `/api/tasks/${taskId}`, // Adjust the URL as needed
			payload: updatedTask,
		});

		expect(response.statusCode).toBe(200);
		const responseBody = JSON.parse(response.body);
		expect(responseBody.data.id).toBe(String(taskId));
		expect(responseBody.data.name).toBe(updatedTask.name);
		expect(responseBody.data.description).toBe(updatedTask.description);
		expect(new Date(responseBody.data.dueDate).toISOString()).toBe(updatedTask.dueDate);
	});

	it('should return status 404 if the task does not exist', async () => {
		const nonExistentTaskId = 9999;
		const updatedTask = {
			name: 'Updated Task 3',
			description: 'Updated Description 3',
			dueDate: new Date().toISOString(),
		};

		const response = await fastify.inject({
			method: 'PUT',
			url: `/api/tasks/${nonExistentTaskId}`, // Adjust the URL as needed
			payload: updatedTask,
		});

		expect(response.statusCode).toBe(400);
	});
});
