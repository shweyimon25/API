import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email().min(1, { message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type SignInInput = z.infer<typeof signInSchema>;
