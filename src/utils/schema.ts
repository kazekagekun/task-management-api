import { z } from 'zod';

export const responseEnvelopeSchema = {
	success: z.boolean(),
	message: z.string(),
	data: z.any().nullable(),
};
