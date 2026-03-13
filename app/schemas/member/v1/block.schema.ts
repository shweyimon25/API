import { z } from "zod";

export const BlockSchema = z.object({
    memberId: z.coerce.number().min(1, { message: "Member ID is required" }),
});

export type BlockInput = z.infer<typeof BlockSchema>;