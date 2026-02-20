import { ConversationType } from "@prisma/client";
import { z } from "zod";

export const createConversationSchema = z.object({
    type: z.enum([
        ConversationType.GROUP,
        ConversationType.PRIVATE
    ], {
        message: "Type must be either PRIVATE or GROUP"
    }),
    name: z.string({
        message: "Name is required"
    }).min(1, "Name is required"),
    participantIds: z.array(z.number().int().positive()).optional() // Only for GROUP conversations
});

export const updateConversationSchema = z.object({
    name: z.string().optional(),
    participantIds: z.array(z.number().int().positive()).optional() // Only for GROUP conversations
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;

