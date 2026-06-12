import { z } from "zod";

export const createRoleSchema = z.object({
  role_name: z.string().min(2),
  role_display_name: z.string().min(2),
  role_description: z.string().min(2),
  role_permissions: z.array(z.string()).default([]),
});

export const updateRoleSchema = createRoleSchema.partial();
