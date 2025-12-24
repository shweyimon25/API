import { ZodSchema, ZodError as ZodErrorType } from "zod";

interface ZodError {
  success: boolean;
  data?: any;
  error?: any;
}

export const validater = async (
  schema: ZodSchema,
  input: object
): Promise<ZodError> => {
  const result = await schema.safeParseAsync(input);

  if (!result.success) {
    const details = result.error.issues.map((issue) => {
      return {
        field: issue.path[0] || issue.path.join("."),
        issue: issue.message,
      };
    });

    return { success: false, error: details };
  } else {
    return { success: true, data: result.data };
  }
};
