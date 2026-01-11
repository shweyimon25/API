import { z } from "zod";

export const createPaymentSchema = z.object({
    memberPlanId: z.coerce.number({
        message: "Member plan is required"
    }),
    memberTypeId: z.coerce.number({
        message: "Member type is required"
    }),
    amount: z.coerce.number({
        message: "Amount is required"
    }),
    bankInformationId: z.coerce.number({
        message: "Bank information is required"
    }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;


