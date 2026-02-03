import { FriendRequestStatus } from "@prisma/client";
import { z } from "zod";

export const createFriendRequestSchema = z.object({
    receiverId: z.coerce.number({
        message: "Receiver ID is required"
    }),
});

export const updateFriendRequestSchema = z.object({
    status: z.enum([FriendRequestStatus.ACCEPTED, FriendRequestStatus.DECLINED], {
        message: "Status must be ACCEPTED or DECLINED",
    }),
});

export type CreateFriendRequestInput = z.infer<typeof createFriendRequestSchema>;
export type UpdateFriendRequestInput = z.infer<typeof updateFriendRequestSchema>;