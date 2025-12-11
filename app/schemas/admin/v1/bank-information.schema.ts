import { z } from "zod";
import { PaymentTypes } from "@prisma/client";

export const createBankInformationSchema = z.object({
  bankAccountHolder: z.string({
    required_error: "Bank account holder is required",
    invalid_type_error: "Bank account holder must be string",
  }),
  bankAccountNumber: z.string({
    required_error: "Bank account number is required",
    invalid_type_error: "Bank account number must be string",
  }),
  phone: z
    .string({
      required_error: "Phone is required",
      invalid_type_error: "Phone must be string",
    })
    .min(10, {
      message: "Phone must be at least 10 characters",
    })
    .max(15, {
      message: "Phone must be at most 15 characters",
    }),
  paymentTypes: z.nativeEnum(PaymentTypes).optional(),
});

export const updateBankInformationSchema = z.object({
  bankAccountHolder: z
    .string({
      invalid_type_error: "Bank account holder must be string",
    })
    .optional(),
  bankAccountNumber: z
    .string({
      invalid_type_error: "Bank account number must be string",
    })
    .optional(),
  phone: z
    .string({
      invalid_type_error: "Phone must be string",
    })
    .optional(),
  paymentTypes: z.nativeEnum(PaymentTypes).optional(),
});

export type CreateBankInformationInput = z.infer<
  typeof createBankInformationSchema
>;
export type UpdateBankInformationInput = z.infer<
  typeof updateBankInformationSchema
>;
