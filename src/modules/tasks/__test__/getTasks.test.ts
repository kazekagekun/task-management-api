import { User } from '@prisma/client';
import { prisma } from '../../../plugins/prisma';
import AuthService from '../../auth/auth.service';

describe('Get Tasks', () => {
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

		await prisma.tasks.createMany({
			data: [
				{ name: 'Task1', description: 'Description1', dueDate: new Date(), userId: 1 },
				{ name: 'Task2', description: 'Description2', dueDate: new Date(), userId: 1 },
				{ name: 'Task3', description: 'Description3', dueDate: new Date(), userId: 1 },
				{ name: 'Task4', description: 'Description4', dueDate: new Date(), userId: 1 },
				{ name: 'Task5', description: 'Description5', dueDate: new Date(), userId: 1 },
				{ name: 'Task6', description: 'Description6', dueDate: new Date(), userId: 1 },
				{ name: 'Task7', description: 'Description7', dueDate: new Date(), userId: 1 },
				{ name: 'Task8', description: 'Description8', dueDate: new Date(), userId: 1 },
				{ name: 'Task9', description: 'Description9', dueDate: new Date(), userId: 1 },
				{ name: 'Task10', description: 'Description10', dueDate: new Date(), userId: 1 },
				{ name: 'Task11', description: 'Description11', dueDate: new Date(), userId: 1 },
				{ name: 'Task12', description: 'Description12', dueDate: new Date(), userId: 1 },
				{ name: 'Task13', description: 'Description13', dueDate: new Date(), userId: 1 },
				{ name: 'Task14', description: 'Description14', dueDate: new Date(), userId: 1 },
			],
		});
	});

	afterAll(async () => {
		// Clean up the database
		await prisma.tasks.deleteMany({});
	});

	it('should retrieve all tasks', async () => {
		const { accessToken } = await authService.createTokens(user);
		const response = await fastify.inject({
			method: 'GET',
			url: '/api/tasks',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(200);
		const responseBody = JSON.parse(response.body);
		expect(Array.isArray(responseBody.data.data)).toBe(true);
		expect(responseBody.data.total).toBe(14);
		expect(responseBody.data.pageTotal).toBe(2);
		expect(responseBody.data.data.length).toBe(10);
		expect(responseBody.data.data[0]).toHaveProperty('id');
		expect(responseBody.data.data[0]).toHaveProperty('name');
		expect(responseBody.data.data[0]).toHaveProperty('description');
		expect(responseBody.data.data[0]).toHaveProperty('dueDate');
	});

	it('should retrieve tasks with pagination', async () => {
		const { accessToken } = await authService.createTokens(user);
		const response = await fastify.inject({
			method: 'GET',
			url: '/api/tasks?page=2',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		expect(response.statusCode).toBe(200);
		const responseBody = JSON.parse(response.body);
		expect(Array.isArray(responseBody.data.data)).toBe(true);
		expect(responseBody.data.total).toBe(14);
		expect(responseBody.data.pageTotal).toBe(2);
		expect(responseBody.data.data.length).toBe(4);
	});

	it('should retrieve tasks with search', async () => {
		const { accessToken } = await authService.createTokens(user);
		const response = await fastify.inject({
			method: 'GET',
			url: '/api/tasks?name=Task2',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});
		expect(response.statusCode).toBe(200);
		const responseBody = JSON.parse(response.body);
		expect(Array.isArray(responseBody.data.data)).toBe(true);
		expect(responseBody.data.data.length).toBe(1);
		expect(responseBody.data.data[0].name).toBe('Task2');
	});

	it('should retrieve tasks with sorting', async () => {
		const { accessToken } = await authService.createTokens(user);
		const response = await fastify.inject({
			method: 'GET',
			url: '/api/tasks?sort=name&order=desc',
			headers: {
				authorization: 'Bearer ' + accessToken,
			},
		});

		console.log(response);
		expect(response.statusCode).toBe(200);
		const responseBody = JSON.parse(response.body);
		expect(Array.isArray(responseBody.data.data)).toBe(true);
		expect(responseBody.data.data.length).toBe(10);
		expect(responseBody.data.data[0].name).toBe('Task9');
	});
});
