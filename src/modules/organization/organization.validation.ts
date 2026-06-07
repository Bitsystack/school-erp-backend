import { z } from "zod";

export const createOrganizationSchema = z.object({
  organization_name: z.string().min(3, "Business name is required"),

  organization_phone: z.string().min(10).max(15),

  organization_whatsapp: z.string().optional(),

  organization_email: z.string().email("Invalid email address"),

  organization_website: z.string().url().optional().or(z.literal("")),

  organization_country: z.string().min(1),

  organization_address: z.string().optional(),

  organization_pincode: z.string().optional(),

  organization_gstin: z.string().optional(),

  organization_upi_id: z.string().optional(),

  organization_logo: z.string().url().optional(),
});

export type CreateOrganizationPayload = z.infer<
  typeof createOrganizationSchema
>;
