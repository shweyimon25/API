import { z } from "zod";
import { MemberRequestStatus } from "@prisma/client";

export const updateMemberRequestSchema = z.object({
    status: z.nativeEnum(MemberRequestStatus, { message: "Status must be PENDING | APPROVED | REJECTED" }).optional(),
    rejectedReason: z.string().optional(),
}).refine((data) => {
    if (data.status === MemberRequestStatus.REJECTED) {
        return data.rejectedReason !== undefined && data.rejectedReason.length > 0;
    }
    return true;
}, {
    message: "Rejected reason is required when status is REJECTED",
    path: ["rejectedReason"],
});

export type UpdateMemberRequestInput = z.infer<typeof updateMemberRequestSchema>;
