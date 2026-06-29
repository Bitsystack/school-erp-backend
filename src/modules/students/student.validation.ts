import { z } from "zod";

export const createStudentSchema = z.object({
  student_name: z.string().min(2, "Name is required"),
  student_email: z.string().email("Invalid email"),
  student_phone: z.string().min(10, "Phone is required"),
  student_gender: z.enum(["Male", "Female", "Other"]),
  student_dob: z.string().min(1, "Date of birth is required"),
  student_blood_group: z.string().optional(),
  student_religion: z.string().optional(),
  student_category: z.string().optional(),
  student_address: z.string().optional(),
  student_city: z.string().optional(),
  student_state: z.string().optional(),
  student_pincode: z.string().optional(),
  student_class_id: z.string().optional(),
  student_section_id: z.string().optional(),
  student_session: z.string().optional(),
  student_admission_date: z.string().optional(),
  student_country: z.string().optional(),
  // Parent info
  father_name: z.string().optional(),
  father_phone: z.string().optional(),
  father_occupation: z.string().optional(),
  mother_name: z.string().optional(),
  mother_phone: z.string().optional(),
  mother_occupation: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_phone: z.string().optional(),
  guardian_relation: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
