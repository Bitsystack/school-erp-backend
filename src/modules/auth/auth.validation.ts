import { z } from "zod";

// ─── Step 1: User registers on landing page ───────────────────
export const registerSchema = z.object({
  user_name: z.string().min(2, "Name is required"),
  user_email: z.string().email("Invalid email"),
  user_phone: z.string().min(10, "Phone number is required"),
  user_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  user_country: z.string().min(2, "Country is required"),
  user_business_type: z.enum(
    ["School", "College", "Coaching", "University", "Other"],
    { error: "Invalid business type" },
  ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Step 2: Setup school/organization ────────────────────────
export const setupOrganizationSchema = z.object({
  organization_name: z.string().min(3, "School name is required"),
  organization_phone: z.string().min(10).max(15),
  organization_email: z.string().email("Invalid email"),
  organization_country: z.string().min(1, "Country is required"),
  organization_address: z.string().optional(),
  organization_pincode: z.string().optional(),
  organization_website: z.string().url().optional().or(z.literal("")),
  organization_whatsapp: z.string().optional(),
  organization_gstin: z.string().optional(),
  organization_upi_id: z.string().optional(),
});

export type SetupOrganizationInput = z.infer<typeof setupOrganizationSchema>;

// ─── Login ────────────────────────────────────────────────────
export const loginSchema = z.object({
  user_email: z.string().email("Invalid email"),
  user_password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Forgot / Reset Password ──────────────────────────────────
export const forgotPasswordSchema = z.object({
  user_email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

// ─── Change Password (logged-in user) ─────────────────────────
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
