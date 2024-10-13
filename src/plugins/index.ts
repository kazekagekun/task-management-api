import { FastifyInstance } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import config from './config';
import prisma from './prisma';
import swagger from './swagger';
import sensible from './sensible';
import cors from './cors';
import jwt from './jwt';

export default fastifyPlugin(async (fastify: FastifyInstance) => {
	await Promise.all([fastify.register(config), fastify.register(sensible), fastify.register(cors)]);

	await Promise.all([fastify.register(prisma), fastify.register(swagger)]);

	await Promise.all([fastify.register(jwt)]);
});
