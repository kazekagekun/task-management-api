import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import fastifyEnv from '@fastify/env';
import dotenvExpand from 'dotenv-expand';
import fastifyPlugin from 'fastify-plugin';

import dotenv from 'dotenv';
dotenvExpand.expand(dotenv.config());

const NODE_ENVS = ['prod', 'test', 'local'] as const;
type NODE_ENV = (typeof NODE_ENVS)[number];

declare module 'fastify' {
	interface FastifyInstance {
		config: {
			HOST: string;
			PORT: number;
			DATABASE_URL: string;
			DATABASE_URL_NON_POOLING: string;
			NODE_ENV: NODE_ENV;
			ALLOWED_ORIGINS: string[];
		};
	}
}

export default fastifyPlugin(
	(
		fastify: FastifyInstance,
		_options: FastifyPluginOptions,
		done: (err?: Error | undefined) => void,
	) => {
		const schema = {
			type: 'object',
			required: ['DATABASE_URL', 'DATABASE_URL_NON_POOLING'],
			properties: {
				HOST: {
					type: 'string',
					default: '0.0.0.0',
				},
				PORT: {
					type: 'number',
					default: 3000,
				},
				DATABASE_URL: {
					type: 'string',
				},
				DATABASE_URL_NON_POOLING: {
					type: 'string',
				},
				NODE_ENV: {
					type: 'string',
					default: 'prod',
				},
				ALLOWED_ORIGINS: {
					type: 'string',
					separator: ',',
					default:
						'http://localhost:3000,http://0.0.0.0:3000,http://127.0.0.1:3000,http://localhost:5173',
				},
			},
		};

		const configOptions = {
			// decorate the Fastify server instance with `config` key
			// such as `fastify.config('PORT')
			confKey: 'config',
			// schema to validate
			schema: schema,
			// source for the configuration data
			data: process.env,
			// will read .env in root folder
			dotenv: true,
			// will remove the additional properties
			// from the data object which creates an
			// explicit schema
			removeAdditional: true,
		};

		/* istanbul ignore next */
		if (NODE_ENVS.find((validName) => validName === process.env.NODE_ENV) === undefined) {
			throw new Error(
				"NODE_ENV is not valid, it must be one of 'prod', 'test' or 'local', not \"" +
					process.env.NODE_ENV +
					'"',
			);
		}

		fastifyEnv(fastify, configOptions, done);
	},
	{ name: 'config' },
);
