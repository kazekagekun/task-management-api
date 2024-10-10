import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import { tasksSchema } from './tasks.schema';
import tasksRoute from './tasks.route';

export default fastifyPlugin(async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
	for (const schema of tasksSchema) {
		fastify.addSchema(schema);
	}

	await fastify.register(tasksRoute, options);
});
