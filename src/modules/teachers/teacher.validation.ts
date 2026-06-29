import { z } from "zod";

export const createTeacherSchema = z.object({
  teacher_name: z.string().min(2, "Name is required"),
  teacher_email: z.string().email("Invalid email"),
  teacher_phone: z.string().min(10, "Phone is required"),
  teacher_gender: z.enum(["Male", "Female", "Other"]).optional(),
  teacher_qualification: z.string().optional(),
  teacher_experience: z.number().min(0).optional(),
  teacher_joining_date: z.string().optional(),
  teacher_salary: z.number().min(0).optional(),
  teacher_address: z.string().optional(),
  teacher_dob: z.string().optional(),
  teacher_country: z.string().optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial();

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
