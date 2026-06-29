import { z } from "zod";

export const createClassSchema = z.object({
  class_name: z.string().min(1, "Class name is required"),
  class_numeric: z.number().optional(),
  class_description: z.string().optional(),
});

export const updateClassSchema = createClassSchema.partial();
