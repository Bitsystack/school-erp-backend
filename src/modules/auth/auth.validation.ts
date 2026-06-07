import { z } from "zod";

export const registerSchema = z.object({
  user_name: z.string().min(2, "Name is required"),
  user_email: z.string().email("Invalid email"),
  user_phone: z.string().min(10, "Phone number is required"),
  user_password: z.string().min(8, "Password must be at least 8 characters"),
  user_country: z.string().min(2, "Country is required"),
  user_business_type: z.string().min(2, "Business type is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  user_email: z.string().email("Invalid email"),
  user_password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
