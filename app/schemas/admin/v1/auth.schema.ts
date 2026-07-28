import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .refine(
      (val) => {
        if (val.includes("@")) {
          // If contains @, validate as email
          return z.string().email().safeParse(val).success;
        } else {
          // If doesn't contain @, validate as username (non-empty string)
          return val.length > 0;
        }
      },
      {
        message: "Invalid email format or username",
      }
    ),
  password: z.string().min(1, { message: "Password is required" }),
});

export type SignInInput = z.infer<typeof signInSchema>;
