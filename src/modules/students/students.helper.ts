import { Student } from "./student.model";

export const GenerateAdmissionNo = async (
  organizationName: string,
  organizationId: string,
): Promise<string> => {
  const prefix = organizationName
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase();

  const lastStudent = await Student.findOne({ organization_id: organizationId })
    .sort({ createdAt: -1 })
    .select("student_admission_no");

  let nextNumber = 1;
  if (lastStudent?.student_admission_no) {
    const match = lastStudent.student_admission_no.match(/(\d+)$/);
    if (match) nextNumber = Number(match[1]) + 1;
  }

  const year = new Date().getFullYear().toString().slice(-2);
  return `${prefix}-STU-${year}${String(nextNumber).padStart(4, "0")}`;
};
