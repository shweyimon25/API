import { z } from "zod";
import { PaymentStatus } from "@prisma/client";

export const updatePaymentStatusSchema = z.object({
    status: z.enum([
        PaymentStatus.CONFIRMED,
        PaymentStatus.CANCELLED,
        PaymentStatus.PAID,
    ], { message: "Status must be CONFIRMED or CANCELLED or PAID" }),
    cancelledReason: z.string().optional(),
}).refine(data => {
    if (data.status === PaymentStatus.CANCELLED) {
        return data.cancelledReason;
    }
    return true;
}, {
    message: "Cancelled reason is required when status is CANCELLED",
    path: ["cancelledReason"],
});

export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;