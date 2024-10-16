import { User } from '@prisma/client';
import { prisma } from '../../../plugins/prisma';
import AuthService from '../../auth/auth.service';

describe('Add Task', () => {
	let authService: AuthService;

	let user: User;

	beforeAll(async () => {
		authService = new AuthService();

		user = await prisma.user.create({
			data: {
				name: 'Test User',
				email: 'test@test.com',
				password: 'password',
			},
		});
	});

	afterAll(async () => {
		// Clean up the database
		await prisma.tasks.deleteMany({});
	});

	it('should add a new task', async () => {
		const { accessToken } = await authService.createTokens(user);

		const newTask = {
			name: 'Test Task',
			description: 'This is a test task',
			dueDate: new Date().toISOString(),
			userId: user.id,
		};

		const response = await fastify.inject({
			method: 'POST',
			url: '/api/tasks', // Adjust the URL as needed
			payload: newTask,
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(201);
		const responseBody = JSON.parse(response.body);
		expect(responseBody.data).toHaveProperty('id');
		expect(responseBody.data.name).toBe(newTask.name);
		expect(responseBody.data.description).toBe(newTask.description);
		expect(new Date(responseBody.data.dueDate).toISOString()).toBe(newTask.dueDate);
	});
});
