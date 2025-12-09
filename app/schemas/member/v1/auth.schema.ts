import { z } from "zod";

export const signUpSchema = z.object({
    loginProviderType: z.enum(["EMAIL", "PHONE"]),
    loginProviderValue: z.string(),
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be string"
    }),
    address: z.string({
        invalid_type_error: "Address must be string"
    }).optional(),
    password: z.string({
        required_error: "Password is required",
        invalid_type_error: "Password must be string"
    }).min(6, {
        message: "Password must be at least 6 characters long"
    }),
    passwordConfirm: z.string({
        required_error: "Password confirmation is required",
        invalid_type_error: "Password confirmation must be string"
    }).min(6, {
        message: "Password confirmation must be at least 6 characters long"
    }),
}).refine((data) => {
    if (data.loginProviderType === "EMAIL") {
        return z.string({
            required_error: "Email is required",
            invalid_type_error: "Email must be string"
        }).email({
            message: "Invalid email address"
        });
    } else {
        return z.string({
            required_error: "Phone is required",
            invalid_type_error: "Phone must be string"
        }).email({
            message: "Invalid email address"
        });
    }
}).refine((data) => data.password !== data.passwordConfirm, {
    message: "Password don't match",
})

export const sigInSchema = z.object({
    loginProviderType: z.enum(["EMAIL", "PHONE"]),
    loginProviderValue: z.string({
        invalid_type_error: "Login provider value must be string"
    }),
    password: z.string({
        required_error: "Password is required",
        invalid_type_error: "Password must be string"
    })
}).refine((data) => {
    if (data.loginProviderType === "EMAIL") {
        return z.string({
            required_error: "Email is required",
            invalid_type_error: "Email must be string"
        }).email({
            message: "Invalid email address"
        });
    } else {
        return z.string({
            required_error: "Phone is required",
            invalid_type_error: "Phone must be string"
        }).email({
            message: "Invalid email address"
        });
    }
})

export type SignInInput = z.infer<typeof sigInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;