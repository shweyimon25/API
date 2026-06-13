import { z } from "zod";
import { PaymentTypes, Status } from "@prisma/client";

export const createBankInformationSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  bankAccountHolder: z.string().min(1, { message: "Bank account holder is required" }),
  bankAccountNumber: z.string().min(1, { message: "Bank account number is required" }),
  phone: z
    .string()
    .min(9, {
      message: "Phone must be at least 9 characters",
    })
    .max(15, {
      message: "Phone must be at most 15 characters",
    }),
  paymentTypes: z.nativeEnum(PaymentTypes).optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export const updateBankInformationSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  bankAccountHolder: z
    .string()
    .optional(),
  bankAccountNumber: z
    .string()
    .optional(),
  phone: z
    .string()
    .min(9, {
      message: "Phone must be at least 9 characters",
    })
    .max(15, {
      message: "Phone must be at most 15 characters",
    })
    .optional(),
  paymentTypes: z.nativeEnum(PaymentTypes).optional(),
  status: z.enum([Status.ACTIVE, Status.INACTIVE], { message: "Status must be ACTIVE or INACTIVE" }).optional(),
});

export type CreateBankInformationInput = z.infer<
  typeof createBankInformationSchema
>;
export type UpdateBankInformationInput = z.infer<
  typeof updateBankInformationSchema
>;
