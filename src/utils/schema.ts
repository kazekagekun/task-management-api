import { z } from 'zod';

export const responseEnvelopeSchema = {
	success: z.boolean(),
	message: z.string().optional(),
	data: z.any().nullable(),
};
