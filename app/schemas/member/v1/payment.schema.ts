import { PaymentRequestType } from "@prisma/client";
import { z } from "zod";

export const createPaymentSchema = z.object({
    memberPlanId: z.coerce.number().optional(),
    memberTypeId: z.coerce.number().optional(),
    shopLevelId: z.coerce.number().optional(),
    amount: z.coerce.number({
        message: "Amount is required"
    }),
    bankInformationId: z.coerce.number({
        message: "Bank information is required"
    }),
    requestType: z.enum([PaymentRequestType.MEMBER_PLAN_UPGRADE, PaymentRequestType.SHOP_LEVEL_UPGRADE], {
        message: "Request type must be MEMBER_PLAN_UPGRADE | SHOP_LEVEL_UPGRADE"
    }),
}).superRefine((data, ctx) => {
    if (data.requestType === PaymentRequestType.MEMBER_PLAN_UPGRADE) {
        if (!data.memberPlanId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Member plan is required for MEMBER_PLAN_UPGRADE",
                path: ["memberPlanId"],
            });
        }
        if (!data.memberTypeId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Member type is required for MEMBER_PLAN_UPGRADE",
                path: ["memberTypeId"],
            });
        }
    }

    if (data.requestType === PaymentRequestType.SHOP_LEVEL_UPGRADE) {
        if (!data.shopLevelId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Shop level is required for SHOP_LEVEL_UPGRADE",
                path: ["shopLevelId"],
            });
        }
    }
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;


