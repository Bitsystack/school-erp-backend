import { z } from "zod";

export const createSectionSchema = z.object({
  class_id: z.string().min(1, "Class ID is required"),
  section_name: z.string().min(1, "Section name is required"),
  section_capacity: z.number().min(1).optional(),
  section_class_teacher_id: z.string().optional(),
});

export const updateSectionSchema = createSectionSchema.partial();
