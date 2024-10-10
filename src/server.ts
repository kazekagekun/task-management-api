import dotenv from 'dotenv';
import { fastifyInitialize } from '.';

const start = async () => {
    dotenv.config();
    let fastify;

    try {
        fastify = await fastifyInitialize();
    } catch (error) {
		console.error('error initializing fastify', error);
		console.error(error);
		return;
    }

    await fastify.listen({
		host: "127.0.0.1",
		port: 3000,
	});
}

start();