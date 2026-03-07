import { z } from "zod";

const attachmentSchema = z.object({
    type: z.enum(['IMAGE', 'FILE', 'VIDEO']),
    url: z.string()
});

export const createMessageSchema = z.object({
    to: z.number(),
    content: z.string(),
    attachments: z.array(attachmentSchema).optional()
});

export const updateMessageSchema = z.object({
    content: z.string(),
    attachments: z.array(attachmentSchema).optional()
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
