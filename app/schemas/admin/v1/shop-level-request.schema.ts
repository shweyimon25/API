import { z } from "zod";
import { MemberRequestStatus } from "@prisma/client";

export const updateShopLevelRequestSchema = z.object({
    status: z.enum([MemberRequestStatus.PENDING, MemberRequestStatus.APPROVED, MemberRequestStatus.REJECTED], { 
        message: "Status must be PENDING or APPROVED or REJECTED" 
    }).optional(),
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

export type UpdateShopLevelRequestInput = z.infer<typeof updateShopLevelRequestSchema>;
