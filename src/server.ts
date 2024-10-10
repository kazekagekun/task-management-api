import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

import { fastifyInitialize } from '.';

const start = async () => {
	dotenvExpand.expand(dotenv.config());
	let fastify;

	try {
		fastify = await fastifyInitialize();
	} catch (error) {
		console.error('error initializing fastify', error);
		console.error(error);
		return;
	}

	await fastify.listen({
		host: fastify.config.HOST,
		port: fastify.config.PORT,
	});
};

start();
