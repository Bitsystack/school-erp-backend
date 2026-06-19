import { Teacher } from "./teacher.model";

export const GenerateTeacherId = async (
  organizationName: string,
  organizationId: string,
) => {
  const prefix = organizationName
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 3)
    .toUpperCase();

  const lastTeacher = await Teacher.findOne({ organization_id: organizationId })
    .sort({ createdAt: -1 })
    .select("teacher_employee_id");

  let nextNumber = 1;

  if (lastTeacher?.teacher_employee_id) {
    const match = lastTeacher.teacher_employee_id.match(/(\d+)$/);

    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  return `${prefix}-TCH-${String(nextNumber).padStart(4, "0")}`;
};
