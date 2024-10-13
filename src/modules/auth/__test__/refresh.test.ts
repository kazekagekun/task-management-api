import { User } from '@prisma/client';
import { v4 } from 'uuid';
import { prisma } from '../../../plugins/prisma';
import { jwt } from '../../../plugins/jwt';
import AuthService from '../auth.service';
import UserService from '../user.service';
import dayjs from 'dayjs';

describe('POST /api/auth/refresh', () => {
	let authService: AuthService;
	let userService: UserService;

	let user: User;

	beforeAll(async () => {
		authService = new AuthService();
		userService = new UserService();

		user = await userService.createUser({
			name: 'testing user 123',
			email: 'testing123@test.com',
			password: '1234',
		});
	});

	beforeEach(async () => {
		await prisma.userSession.deleteMany();
	});

	it('should return status 200, set a valid refreshToken and return a new valid accessToken', async () => {
		const { refreshToken } = await authService.createTokens(user);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/refresh',
			body: {
				refreshToken: refreshToken,
			},
		});

		const newRefreshToken = JSON.parse(response.body).refreshToken;

		// Refresh token
		expect(response.statusCode).toBe(200);
		expect(jwt.verify(newRefreshToken)).toBeTruthy();

		// Access token
		expect(jwt.verify(response.json().accessToken)).toBeTruthy();
	});

	it('should return status 401, when using refreshToken that has already been used', async () => {
		jest.useFakeTimers({ now: Date.now() - 1000 });
		const { refreshToken } = await authService.createTokens(user);
		jest.useRealTimers();

		await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/refresh',
			body: {
				refreshToken: refreshToken,
			},
		});

		expect(await prisma.userSession.count()).toBe(1);

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/refresh',
			body: {
				refreshToken: refreshToken,
			},
		});

		expect(await prisma.userSession.count()).toBe(0);

		expect(response.statusCode).toBe(401);
		expect(response.json()).toMatchObject({
			error: 'Unauthorized',
			message: 'Unauthorized',
			statusCode: 401,
		});
	});

	it('should return status 401, refreshToken is verifiable, but not valid', async () => {
		const { refreshToken } = await authService.createTokens(user);

		await prisma.userSession.deleteMany({
			where: {
				refreshToken: refreshToken,
			},
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/refresh',
			body: {
				refreshToken: refreshToken,
			},
		});

		expect(response.statusCode).toBe(401);
		expect(response.json()).toMatchObject({
			error: 'Unauthorized',
			message: 'Unauthorized',
			statusCode: 401,
		});
	});

	it('should return status 401, refreshToken absolute expiry is passed', async () => {
		const tokenFamily = v4();

		const refreshToken = jwt.signRefreshToken({
			sub: user.id,
			iat: dayjs().unix() - 60,
			aex: dayjs().unix() - 30,
			tokenFamily: tokenFamily,
		});

		await prisma.userSession.create({
			data: {
				refreshToken: refreshToken,
				userId: user.id,
				tokenFamily: tokenFamily,
			},
		});

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/refresh',
			body: {
				refreshToken: refreshToken,
			},
		});

		expect(response.statusCode).toBe(401);
		expect(response.json()).toMatchObject({
			error: 'Unauthorized',
			message: 'Unauthorized',
			statusCode: 401,
		});
	});

	it('should return status 401, refreshToken expired', async () => {
		jest.useFakeTimers({
			now: Date.now() - 1000 * 60 * 60 * 24 * 14 - 1000,
		});
		const { refreshToken } = await authService.createTokens(user);
		jest.useRealTimers();

		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/refresh',
			body: {
				refreshToken: refreshToken,
			},
		});

		expect(response.statusCode).toBe(401);
		expect(response.json()).toMatchObject({
			error: 'Unauthorized',
			message: 'Unauthorized',
			statusCode: 401,
		});
	});

	it('should return status 401, refreshToken cookie invalid', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/refresh',
			body: {
				refreshToken: 'invalid refresh token!!!',
			},
		});

		expect(response.statusCode).toBe(401);
		expect(response.json()).toMatchObject({
			error: 'Unauthorized',
			message: 'Unauthorized',
			statusCode: 401,
		});
	});

	it('should return status 401, user does not exist', async () => {
		const response = await global.fastify.inject({
			method: 'POST',
			url: '/api/auth/refresh',
			body: {
				refreshToken: jwt.signRefreshToken({
					sub: 542,
					iat: dayjs().unix(),
					aex: dayjs().unix() + 60,
					tokenFamily: v4(),
				}),
			},
		});

		expect(response.statusCode).toBe(401);
		expect(response.json()).toMatchObject({
			error: 'Unauthorized',
			message: 'Unauthorized',
			statusCode: 401,
		});
	});
});
