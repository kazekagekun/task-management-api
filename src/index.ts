import Fastify from 'fastify';

const getLoggerConfig = () => {
	switch (process.env.NODE_ENV) {
		case 'test':
			return false;

		case 'local':
			return {
				transport: {
					target: 'pino-pretty',
					options: {
						translateTime: 'HH:MM:ss Z',
					},
				},
			};

		default:
			return true;
	}
};

export async function fastifyInitialize() {
	const fastify = Fastify({
		logger: getLoggerConfig(),
		pluginTimeout: 30000, // 20 seconds
	});

	return fastify;
}
