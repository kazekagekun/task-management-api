import { User } from '@prisma/client';
import { prisma } from '../../../plugins/prisma';
import AuthService from '../../auth/auth.service';
// Register your routes and plugins here
// Example: fastify.register(require('./your-routes-file'));

describe('PUT /api/tasks/:id', () => {
	let authService: AuthService;

	let user: User;
	
	let taskId: number;

	beforeAll(async () => {
		authService = new AuthService();

		user = await prisma.user.create({
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
				userId: user.id,
			},
		});
		taskId = task.id;
	});

	afterAll(async () => {
		// Clean up the database
		await prisma.tasks.deleteMany({});
	});

	it('should update the task', async () => {
		const { accessToken } = await authService.createTokens(user);
		const updatedTask = {
			name: 'Updated Task',
			description: 'Updated Description',
			dueDate: new Date().toISOString(),
		};

		const response = await fastify.inject({
			method: 'PUT',
			url: `/api/tasks/${taskId}`,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: updatedTask,
		});

		expect(response.statusCode).toBe(200);
		const responseBody = JSON.parse(response.body);
		expect(responseBody.data.id).toBe(String(taskId));
		expect(responseBody.data.name).toBe(updatedTask.name);
		expect(responseBody.data.description).toBe(updatedTask.description);
		expect(new Date(responseBody.data.dueDate).toISOString()).toBe(updatedTask.dueDate);
	});

	it('should return status 400 if the task does not exist', async () => {
		const { accessToken } = await authService.createTokens(user);
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
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(400);
	});

	it('throw error if updating different user id ', async () => {
		const differentUser = {
			name: 'Different User',
			id: 2,
			email: 'testdifferentuseremail@test.com',
			password: "123",
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		user = await prisma.user.create({
			data: differentUser,
		});
			
		const { accessToken } = await authService.createTokens(differentUser);

		const updatedTask = {
			name: 'Updated Task',
			description: 'Updated Description',
			dueDate: new Date().toISOString(),
		};

		const response = await fastify.inject({
			method: 'PUT',
			url: `/api/tasks/${taskId}`,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
			payload: updatedTask,
		});

		expect(response.statusCode).toBe(400);
	});
});
