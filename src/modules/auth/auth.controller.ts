import { FastifyReply, FastifyRequest } from 'fastify';
import AuthService from './auth.service';
import UserService from './user.service';
import { LoginInput } from './auth.schema';

export default class AuthController {
	private authService: AuthService;
	private userService: UserService;

	constructor(authService: AuthService, userService: UserService) {
		this.authService = authService;
		this.userService = userService;
	}

	public async loginHandler(
		request: FastifyRequest<{
			Body: LoginInput;
		}>,
		reply: FastifyReply,
	) {
		try {
			const user = await this.userService.getUserByEmail(request.body.email);
			console.log(process.env);

			if (!this.authService.verifyPassword(user.password, request.body.password)) {
				throw new Error('password incorrect');
			}

			const { refreshToken, accessToken } = await this.authService.createTokens(user);

			return reply.code(200).send({
				accessToken: accessToken,
				refreshToken: refreshToken,
			});
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			console.log(process.env);
			console.log(e);
			return reply.unauthorized('email and/or password incorrect');
		}
	}

	public async refreshHandler(
		request: FastifyRequest<{
			Body: {
				refreshToken: string;
			};
		}>,
		reply: FastifyReply,
	) {
		try {
			const { refreshToken, accessToken } = await this.authService.refreshByToken(
				request.body.refreshToken as string,
			);

			return reply.code(200).send({
				accessToken: accessToken,
				refreshToken: refreshToken,
			});
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			return reply.unauthorized();
		}
	}

	public async logoutHandler(request: FastifyRequest, reply: FastifyReply) {
		await this.authService.deleteUserSessionByTokenFamily(request.user.tokenFamily);

		return reply.code(200).send();
	}

	public async userHandler(request: FastifyRequest, reply: FastifyReply) {
		try {
			const user = await this.userService.getUserById(request.user.sub);
			return reply.code(200).send(user);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			return reply.unauthorized();
		}
	}
}
