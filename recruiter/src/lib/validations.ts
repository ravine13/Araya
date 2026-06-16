import { z } from "zod";

export const authSignInSchema = z.object({
  email: z.string().email("Enter a valid work email"),
  password: z.string().min(1, "Password is required"),
});

export const authSignUpRecruiterSchema = z.object({
  hospitalName: z.string().min(2, "Hospital / clinic name is required"),
  name: z.string().min(2, "Your name must be at least 2 characters"),
  email: z.string().email("Enter a valid work email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
