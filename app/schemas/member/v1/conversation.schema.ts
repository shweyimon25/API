import { ConversationStatus, ConversationType, ParticipantRole } from "@prisma/client";
import { z } from "zod";

export const createConversationSchema = z.object({
    type: z.enum([ConversationType.GROUP, ConversationType.TRAINER_GROUP])
        .default(ConversationType.GROUP),
    name: z.string({
        message: "Name is required"
    }).min(1, "Name is required"),
    gender: z.enum(["MALE", "FEMALE", "BOTH"]).optional(),
    proficiencLevelId: z.number().int().positive().optional(),
    bodyGoalId: z.number().int().positive().optional(),
}).superRefine((data, ctx) => {
    // Logic for Trainer Groups
    if (data.type === ConversationType.TRAINER_GROUP) {
        if (!data.gender) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Gender is required for trainer groups",
                path: ["gender"],
            });
        }
        if (!data.proficiencLevelId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Proficiency level is required",
                path: ["proficiencLevelId"],
            });
        }
        if (!data.bodyGoalId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Body goal is required",
                path: ["bodyGoalId"],
            });
        }
    }
});

export const updateConversationSchema = z.object({
    name: z.string().optional(),
});

export const addParticipantsSchema = z.object({
    participantId: z.number().int().positive(),
});

export const updateParticipantRoleSchema = z.object({
    role: z.enum([ParticipantRole.ADMIN, ParticipantRole.MEMBER])
});

export const requestAcceptConversationSchema = z.object({
    status : z.enum([ConversationStatus.ACCEPTED, ConversationStatus.REQUESTED])
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type RequestAcceptConversationInput = z.infer<typeof requestAcceptConversationSchema>;
export type AddParticipantsInput = z.infer<typeof addParticipantsSchema>;
export type UpdateParticipantRoleInput = z.infer<typeof updateParticipantRoleSchema>;
