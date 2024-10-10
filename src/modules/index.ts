import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import task from './tasks';

export default fastifyPlugin(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
	const getOptionsWithPrefix = (options: FastifyPluginOptions, prefix: string) => {
		return {
			...options,
			prefix: options.prefix + prefix,
		};
	};

	fastify.get('/api/health', async () => {
		return { status: 'OK' };
	});

	await Promise.all([fastify.register(task, getOptionsWithPrefix(options, '/task'))]);
});
