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

export const createMessageReactionSchema = z.object({
    messageId: z.number(),
    reaction: z.string()
});

export const deleteMessageReactionSchema = z.object({
    messageId: z.number()
});

export const uploadMessageSchema = z.object({
    type: z.enum([
        'IMAGE',
        'FILE',
        'VIDEO'
    ])
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type UploadMessageInput = z.infer<typeof uploadMessageSchema>;
export type CreateMessageReactionInput = z.infer<typeof createMessageReactionSchema>;
export type DeleteMessageReactionInput = z.infer<typeof deleteMessageReactionSchema>;
