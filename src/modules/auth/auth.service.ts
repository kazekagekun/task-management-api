import { compareSync } from 'bcrypt';
import { prisma } from '../../plugins/prisma';
import { accessTokenPayload, jwt, refreshTokenPayload } from '../../plugins/jwt';
import { v4 } from 'uuid';
import dayjs from 'dayjs';

export default class AuthService {
	public verifyPassword(userPassword: string, password: string): boolean {
		return compareSync(password, userPassword);
	}

	private createAccessToken(
		oldRefreshToken: string,
		user: {
			id: number;
			email: string;
			name: string;
		},
	): {
		accessToken: string;
		accessTokenPayload: accessTokenPayload;
	} {
		const refreshTokenObject = jwt.decodeRefreshToken(oldRefreshToken);

		const accessToken = jwt.signAccessToken({
			sub: refreshTokenObject.sub,
			iat: dayjs().unix(),
			tokenFamily: refreshTokenObject.tokenFamily,
			user: user,
		});

		return {
			accessToken,
			accessTokenPayload: jwt.decodeAccessToken(accessToken),
		};
	}

	private async createRefreshToken(user: { id: number; name: string; email: string }): Promise<{
		refreshToken: string;
		refreshTokenPayload: refreshTokenPayload;
	}> {
		const tokenFamily = v4();

		const refreshToken = jwt.signRefreshToken({
			sub: user.id,
			iat: dayjs().unix(),
			aex: dayjs().unix() + 60 * 60 * 24 * 365,
			tokenFamily: tokenFamily,
		});

		await prisma.userSession.create({
			data: {
				refreshToken: refreshToken,
				tokenFamily: tokenFamily,
				userId: user.id,
			},
		});

		return {
			refreshToken: refreshToken,
			refreshTokenPayload: jwt.decodeRefreshToken(refreshToken),
		};
	}

	private async createRefreshTokenByRefreshToken(oldRefreshToken: string): Promise<{
		refreshToken: string;
		refreshTokenPayload: refreshTokenPayload;
	}> {
		const oldRefreshTokenObject = jwt.decodeRefreshToken(oldRefreshToken);

		const refreshToken = jwt.signRefreshToken({
			sub: oldRefreshTokenObject.sub,
			iat: dayjs().unix(),
			aex: oldRefreshTokenObject.aex,
			tokenFamily: oldRefreshTokenObject.tokenFamily,
		});

		await prisma.userSession.update({
			where: {
				tokenFamily: oldRefreshTokenObject.tokenFamily,
			},
			data: {
				refreshToken: refreshToken,
			},
		});

		return {
			refreshToken: refreshToken,
			refreshTokenPayload: jwt.decodeRefreshToken(refreshToken),
		};
	}

	public async createTokens(user: { id: number; name: string; email: string }): Promise<{
		refreshToken: string;
		refreshTokenPayload: refreshTokenPayload;
		accessToken: string;
		accessTokenPayload: accessTokenPayload;
	}> {
		const { refreshToken, refreshTokenPayload } = await this.createRefreshToken(user);
		const { accessToken, accessTokenPayload } = this.createAccessToken(refreshToken, user);

		return {
			refreshToken: refreshToken,
			refreshTokenPayload: refreshTokenPayload,
			accessToken: accessToken,
			accessTokenPayload: accessTokenPayload,
		};
	}

	public async refreshByToken(oldRefreshToken: string): Promise<{
		refreshToken: string;
		refreshTokenPayload: refreshTokenPayload;
		accessToken: string;
		accessTokenPayload: accessTokenPayload;
	}> {
		jwt.verify(oldRefreshToken);

		const oldRefreshTokenObject = jwt.decodeRefreshToken(oldRefreshToken);

		if (oldRefreshTokenObject.aex < dayjs().unix()) {
			await prisma.userSession.delete({
				where: {
					tokenFamily: oldRefreshTokenObject.tokenFamily,
				},
			});

			throw new Error('Refresh token has reached absolute expiry');
		}

		const userSession = await prisma.userSession.findFirst({
			where: {
				refreshToken: oldRefreshToken,
				userId: oldRefreshTokenObject.sub,
			},
			include: {
				user: true,
			},
		});

		if (!userSession) {
			await prisma.userSession.delete({
				where: {
					tokenFamily: oldRefreshTokenObject.tokenFamily,
				},
			});

			throw new Error('Refresh token has already been used');
		}

		const { refreshToken, refreshTokenPayload } =
			await this.createRefreshTokenByRefreshToken(oldRefreshToken);
		const { accessToken, accessTokenPayload } = this.createAccessToken(
			refreshToken,
			userSession.user,
		);

		return {
			refreshToken: refreshToken,
			refreshTokenPayload: refreshTokenPayload,
			accessToken: accessToken,
			accessTokenPayload: accessTokenPayload,
		};
	}

	public async deleteUserSessionByTokenFamily(tokenFamily: string): Promise<void> {
		await prisma.userSession.deleteMany({
			where: {
				tokenFamily: tokenFamily,
			},
		});
	}
}
