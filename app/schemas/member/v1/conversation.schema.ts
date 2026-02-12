import { z } from "zod";

export const createConversationSchema = z.object({
    type: z.enum(["PRIVATE", "GROUP"]),
});

export const joinConversationSchema = z.object({
    conversationId: z.number().int().positive(),
});

