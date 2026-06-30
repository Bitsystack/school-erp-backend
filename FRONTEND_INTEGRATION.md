# School ERP — Frontend Integration (TypeScript)

> Base URL: `http://localhost:5000/api/v1`  
> Stack: React + TypeScript + Axios  
> Auth: HTTP-only cookies (auto-managed by browser)

---

## 1. Project Setup

### `.env`
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Install
```bash
npm install axios
```

---

## 2. Axios Instance — `src/lib/api.ts`

```typescript
import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // REQUIRED — sends cookies
  headers: { "Content-Type": "application/json" },
});

// Auto refresh on 401
let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve) =>
          queue.push(() => resolve(api(original)))
        );
      }
      isRefreshing = true;
      try {
        await api.post("/auth/refresh-token");
        queue.forEach((fn) => fn());
        queue = [];
        return api(original);
      } catch {
        queue = [];
        window.location.href = "/login";
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 3. Types — `src/types/index.ts`

```typescript
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface Role {
  _id: string;
  role_name: string;
  role_display_name: string;
  role_permissions: string[];
}

export interface Organization {
  _id: string;
  organization_name: string;
  organization_email: string;
  organization_phone: string;
  organization_whatsapp?: string;
  organization_website?: string;
  organization_country: string;
  organization_address?: string;
  organization_pincode?: string;
  organization_gstin?: string;
  organization_upi_id?: string;
  organization_logo?: string;
  organization_owner_id: string;
  createdAt: string;
}

export interface User {
  _id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_country: string;
  user_business_type: string;
  user_isEmailVerified: boolean;
  user_isActive: boolean;
  user_hasBusiness: boolean;
  user_organization_id: string;
  user_lastLogin?: string;
  role?: Role;
  organization?: Organization;
}

export type BusinessType = "School" | "College" | "Coaching" | "University" | "Other";
export type SubjectType = "Theory" | "Practical" | "Both";
export type AttendanceStatus = "Present" | "Absent" | "Late" | "Leave";
export type ExamStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
export type FeeFrequency = "Monthly" | "Quarterly" | "Annually" | "OneTime";
export type PaymentMode = "Cash" | "Online" | "Cheque" | "Bank Transfer";
export type WeekDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
export type LeaveType = "Sick" | "Casual" | "Earned" | "Maternity" | "Other";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";
export type EmployeeType = "Teacher" | "Staff";
export type AnnouncementTarget = "All" | "Teachers" | "Students" | "Parents" | "Staff";
export type HostelType = "Boys" | "Girls" | "Mixed";
export type RoomType = "Single" | "Double" | "Triple" | "Dormitory";
export type MemberType = "Student" | "Teacher" | "Staff";
export type ComplaintStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type AdmissionStatus = "Pending" | "Approved" | "Rejected" | "Enrolled";
export type Gender = "Male" | "Female" | "Other";
```


---

## 4. Auth Service — `src/services/auth.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, User, Organization } from "../types";

// ── Types ───────────────────────────────────────────────────
export interface RegisterPayload {
  user_name: string;
  user_email: string;
  user_phone: string;
  user_password: string;       // min 8 chars, 1 uppercase, 1 number
  user_country: string;
  user_business_type: "School" | "College" | "Coaching" | "University" | "Other";
}

export interface SetupOrgPayload {
  organization_name: string;   // required
  organization_phone: string;  // required
  organization_email: string;  // required
  organization_country: string; // required
  organization_address?: string;
  organization_pincode?: string;
  organization_website?: string;
  organization_whatsapp?: string;
  organization_gstin?: string;
  organization_upi_id?: string;
}

export interface LoginPayload {
  user_email: string;
  user_password: string;
}

// ── Functions ────────────────────────────────────────────────
export const authService = {
  // Step 1: Register
  register: (data: RegisterPayload) =>
    api.post<ApiResponse<{ user_id: string; user_email: string; user_isEmailVerified: boolean; user_hasBusiness: boolean }>>("/auth/register", data),

  // Step 2: Verify email (GET with token from email link)
  verifyEmail: (token: string) =>
    api.get<ApiResponse<{ user_id: string; user_hasBusiness: boolean }>>(`/auth/verify-email?token=${token}`),

  // Resend verification
  resendVerification: (user_email: string) =>
    api.post<ApiResponse<null>>("/auth/resend-verification", { user_email }),

  // Step 3: Setup school (after email verified)
  setupOrganization: (data: SetupOrgPayload) =>
    api.post<ApiResponse<{ organization: Organization; user: User }>>("/auth/setup-organization", data),

  // Login
  login: (data: LoginPayload) =>
    api.post<ApiResponse<{ user: User }>>("/auth/login", data),

  // Logout
  logout: () => api.post<ApiResponse<null>>("/auth/logout"),

  // Refresh token (called automatically by interceptor)
  refreshToken: () => api.post<ApiResponse<null>>("/auth/refresh-token"),

  // Forgot password
  forgotPassword: (user_email: string) =>
    api.post<ApiResponse<null>>("/auth/forgot-password", { user_email }),

  // Reset password
  resetPassword: (token: string, password: string) =>
    api.post<ApiResponse<null>>("/auth/reset-password", { token, password }),

  // Change password (logged-in)
  changePassword: (current_password: string, new_password: string) =>
    api.post<ApiResponse<null>>("/auth/change-password", { current_password, new_password }),

  // Get my profile
  getMe: () =>
    api.get<ApiResponse<{ user: User; organization: Organization; role: any }>>("/user/my-info"),
};

// ── Routing helper after login/verify ───────────────────────
export const getRedirectPath = (user: User): string => {
  if (!user.user_isEmailVerified) return "/verify-email";
  if (!user.user_hasBusiness) return "/setup-school";
  return "/dashboard";
};
```

---

## 5. Organization Service — `src/services/organization.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse, Organization } from "../types";

export interface UpdateOrgPayload {
  organization_name?: string;
  organization_phone?: string;
  organization_email?: string;
  organization_country?: string;
  organization_address?: string;
  organization_pincode?: string;
  organization_website?: string;
  organization_whatsapp?: string;
  organization_gstin?: string;
  organization_upi_id?: string;
  organization_logo?: string;
}

export interface BulkSubject {
  subject_name: string;
  subject_code: string;
  subject_type?: "Theory" | "Practical" | "Both";
  subject_full_marks?: number;
  subject_pass_marks?: number;
}

export interface BulkClassInput {
  class_name: string;
  class_numeric?: number;
  class_description?: string;
  section_capacity?: number;
  sections: string[];          // e.g. ["A", "B", "C"]
  subjects: BulkSubject[];
}

export const organizationService = {
  // My organization
  getMyOrganization: () =>
    api.get<ApiResponse<Organization>>("/organization/my-organization"),

  // Overview stats
  getOverview: () =>
    api.get<ApiResponse<any>>("/organization/overview"),

  // Full academic tree
  getAcademicStructure: () =>
    api.get<ApiResponse<any[]>>("/organization/academic-structure"),

  // Bulk create classes + sections + subjects
  bulkCreateStructure: (classes: BulkClassInput[]) =>
    api.post<ApiResponse<any[]>>("/organization/academic-structure/bulk", { classes }),

  // All members
  getMembers: (params?: { role_type?: "teacher" | "staff" | "student"; page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<any>>("/organization/members", { params }),

  // Update org
  updateOrganization: (data: UpdateOrgPayload) =>
    api.patch<ApiResponse<Organization>>("/organization/update", data),

  // Upload logo
  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append("logo", file);
    return api.post<ApiResponse<{ url: string; public_id: string }>>("/organization/logo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Get org by ID
  getById: (id: string) =>
    api.get<ApiResponse<Organization>>(`/organization/organization/${id}`),
};
```

---

## 6. Academic Services

### `src/services/class.service.ts`
```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse } from "../types";

export interface ClassData {
  _id: string;
  class_name: string;
  class_numeric?: number;
  class_description?: string;
  class_status: boolean;
  sections?: any[];
  subjects?: any[];
  student_count?: number;
  section_count?: number;
  subject_count?: number;
}

export const classService = {
  create: (data: { class_name: string; class_numeric?: number; class_description?: string }) =>
    api.post<ApiResponse<ClassData>>("/class/create", data),

  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<ClassData>>("/class/list", { params }),

  // Returns class + sections + subjects + student count
  getById: (id: string) =>
    api.get<ApiResponse<ClassData>>(`/class/${id}`),

  // Students of a class
  getStudents: (classId: string, params?: { section_id?: string; page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<any>>(`/class/${classId}/students`, { params }),

  update: (id: string, data: Partial<{ class_name: string; class_numeric: number; class_description: string; class_status: boolean }>) =>
    api.patch<ApiResponse<ClassData>>(`/class/update/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/class/delete/${id}`),
};
```

### `src/services/section.service.ts`
```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse } from "../types";

export const sectionService = {
  create: (data: { class_id: string; section_name: string; section_capacity?: number; section_class_teacher_id?: string }) =>
    api.post<ApiResponse<any>>("/section/create", data),

  list: (params?: { class_id?: string; page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<any>>("/section/list", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/section/${id}`),

  update: (id: string, data: any) =>
    api.patch<ApiResponse<any>>(`/section/update/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/section/delete/${id}`),
};
```

### `src/services/subject.service.ts`
```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse } from "../types";

export interface CreateSubjectPayload {
  class_id: string;
  subject_name: string;
  subject_code: string;
  subject_type?: "Theory" | "Practical" | "Both";
  subject_teacher_id?: string;
  subject_full_marks?: number;
  subject_pass_marks?: number;
}

export const subjectService = {
  create: (data: CreateSubjectPayload) =>
    api.post<ApiResponse<any>>("/subject/create", data),

  list: (params?: { class_id?: string; page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<any>>("/subject/list", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/subject/${id}`),

  update: (id: string, data: Partial<CreateSubjectPayload>) =>
    api.patch<ApiResponse<any>>(`/subject/update/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/subject/delete/${id}`),
};
```


---

## 7. Teacher Service — `src/services/teacher.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse, Gender } from "../types";

export interface CreateTeacherPayload {
  teacher_name: string;
  teacher_email: string;
  teacher_phone: string;
  teacher_gender?: Gender;
  teacher_qualification?: string;
  teacher_experience?: number;
  teacher_joining_date?: string;  // "YYYY-MM-DD"
  teacher_salary?: number;
  teacher_address?: string;
  teacher_dob?: string;
  teacher_country?: string;
  teacher_photo?: string;
}

export interface Teacher {
  _id: string;
  teacher_employee_id: string;
  teacher_name: string;
  teacher_email: string;
  teacher_phone: string;
  teacher_gender?: Gender;
  teacher_qualification?: string;
  teacher_experience?: number;
  teacher_salary?: number;
  teacher_photo?: string;
  teacher_status: boolean;
  organization_id: string;
  user_id: string;
}

export const teacherService = {
  // Returns teacher data + credentials: { email, password }
  create: (data: CreateTeacherPayload) =>
    api.post<ApiResponse<{ data: Teacher; credentials: { email: string; password: string } }>>("/teacher/create", data),

  // ⚠️ Uses pageSize not limit
  list: (params?: { page?: number; pageSize?: number; search?: string }) =>
    api.get<PaginatedResponse<Teacher>>("/teacher/list", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Teacher & { user: any; role: any }>>(`/teacher/${id}`),

  update: (id: string, data: Partial<CreateTeacherPayload>) =>
    api.patch<ApiResponse<Teacher>>(`/teacher/update/${id}`, data),

  toggleStatus: (id: string) =>
    api.patch<ApiResponse<{ teacher_id: string; teacher_status: boolean }>>(`/teacher/status/${id}`),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/teacher/delete/${id}`),

  uploadPhoto: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return api.post<ApiResponse<{ url: string; public_id: string }>>("/teacher/add-image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
```

---

## 8. Student Service — `src/services/student.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse, Gender } from "../types";

export interface CreateStudentPayload {
  student_name: string;         // required
  student_email: string;        // required
  student_phone: string;        // required
  student_gender: Gender;       // required
  student_dob: string;          // required "YYYY-MM-DD"
  student_blood_group?: string;
  student_religion?: string;
  student_category?: string;
  student_address?: string;
  student_city?: string;
  student_state?: string;
  student_pincode?: string;
  student_class_id?: string;
  student_section_id?: string;
  student_session?: string;
  student_admission_date?: string;
  student_country?: string;
  father_name?: string;
  father_phone?: string;
  father_occupation?: string;
  mother_name?: string;
  mother_phone?: string;
  mother_occupation?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_relation?: string;
}

export interface Student {
  _id: string;
  student_admission_no: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_gender: Gender;
  student_dob: string;
  student_status: boolean;
  student_class_id?: any;
  student_section_id?: any;
  student_session?: string;
  student_photo?: string;
}

export const studentService = {
  create: (data: CreateStudentPayload) =>
    api.post<ApiResponse<{ data: Student; credentials: { email: string; password: string } }>>("/student/create", data),

  list: (params?: { page?: number; limit?: number; search?: string; class_id?: string; section_id?: string; status?: boolean }) =>
    api.get<PaginatedResponse<Student>>("/student/list", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Student>>(`/student/${id}`),

  update: (id: string, data: Partial<CreateStudentPayload>) =>
    api.patch<ApiResponse<Student>>(`/student/update/${id}`, data),

  toggleStatus: (id: string) =>
    api.patch<ApiResponse<{ student_status: boolean }>>(`/student/status/${id}`),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/student/delete/${id}`),
};
```

---

## 9. Staff Service — `src/services/staff.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse, Gender } from "../types";

export interface CreateStaffPayload {
  staff_name: string;
  staff_email: string;
  staff_phone: string;
  staff_gender?: Gender;
  staff_dob?: string;
  staff_department?: string;
  staff_designation?: string;
  staff_qualification?: string;
  staff_experience?: number;
  staff_joining_date?: string;
  staff_salary?: number;
  staff_address?: string;
  staff_country?: string;
}

export const staffService = {
  create: (data: CreateStaffPayload) =>
    api.post<ApiResponse<{ data: any; credentials: { email: string; password: string } }>>("/staff/create", data),

  list: (params?: { page?: number; limit?: number; search?: string; department?: string }) =>
    api.get<PaginatedResponse<any>>("/staff/list", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/staff/${id}`),

  update: (id: string, data: Partial<CreateStaffPayload>) =>
    api.patch<ApiResponse<any>>(`/staff/update/${id}`, data),

  toggleStatus: (id: string) =>
    api.patch<ApiResponse<any>>(`/staff/status/${id}`),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/staff/delete/${id}`),
};
```

---

## 10. Attendance Service — `src/services/attendance.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, AttendanceStatus } from "../types";

export interface AttendanceRecord {
  student_id: string;
  status: AttendanceStatus;
  remark?: string;
}

export const attendanceService = {
  // Bulk mark — upsert (calling again on same date overwrites)
  mark: (data: { class_id: string; section_id: string; attendance_date: string; attendance_records: AttendanceRecord[] }) =>
    api.post<ApiResponse<null>>("/attendance/mark", data),

  // Get by date (class_id + date required)
  getByDate: (params: { class_id: string; date: string; section_id?: string }) =>
    api.get<ApiResponse<any[]>>("/attendance/by-date", { params }),

  // Student monthly
  getStudentAttendance: (studentId: string, params?: { month?: number; year?: number }) =>
    api.get<ApiResponse<any>>(`/attendance/student/${studentId}`, { params }),

  // Class summary
  getClassSummary: (params: { class_id: string; section_id?: string; month?: number; year?: number }) =>
    api.get<ApiResponse<any[]>>("/attendance/class-summary", { params }),
};
```

---

## 11. Exam & Marks Service — `src/services/exam.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse, ExamStatus } from "../types";

export interface CreateExamPayload {
  class_id: string;
  exam_name: string;
  exam_term?: string;
  exam_session?: string;
  exam_start_date: string;
  exam_end_date: string;
  exam_description?: string;
  exam_status?: ExamStatus;
}

export interface MarkEntry {
  student_id: string;
  mark_obtained: number;
  mark_full: number;
  mark_pass: number;
  mark_remark?: string;
}

export const examService = {
  create: (data: CreateExamPayload) => api.post<ApiResponse<any>>("/exam/create", data),
  list: (params?: { page?: number; limit?: number; search?: string; class_id?: string; status?: ExamStatus }) =>
    api.get<PaginatedResponse<any>>("/exam/list", { params }),
  getById: (id: string) => api.get<ApiResponse<any>>(`/exam/${id}`),
  update: (id: string, data: Partial<CreateExamPayload>) => api.patch<ApiResponse<any>>(`/exam/update/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/exam/delete/${id}`),
};

export const markService = {
  // Bulk enter marks for one subject
  enter: (data: { exam_id: string; subject_id: string; class_id: string; marks: MarkEntry[] }) =>
    api.post<ApiResponse<null>>("/mark/enter", data),

  getByExam: (params: { exam_id?: string; subject_id?: string; class_id?: string }) =>
    api.get<ApiResponse<any[]>>("/mark/by-exam", { params }),

  getStudentMarks: (studentId: string, examId?: string) =>
    api.get<ApiResponse<any[]>>(`/mark/student/${studentId}`, { params: examId ? { exam_id: examId } : {} }),

  // Full result card with grade + pass/fail
  getResultCard: (studentId: string, examId: string) =>
    api.get<ApiResponse<{ marks: any[]; summary: { total_obtained: number; total_full: number; percentage: string; overall_grade: string; result: string } }>>(`/mark/result/${studentId}/${examId}`),

  update: (id: string, data: { mark_obtained: number; mark_full: number; mark_remark?: string }) =>
    api.patch<ApiResponse<any>>(`/mark/update/${id}`, data),
};
```


---

## 12. Fee Service — `src/services/fee.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse, FeeFrequency, PaymentMode } from "../types";

export interface CreateFeeStructurePayload {
  class_id: string;
  fee_title: string;
  fee_description?: string;
  fee_amount: number;
  fee_frequency: FeeFrequency;
  fee_due_day?: number;
  fee_session?: string;
}

export interface CollectFeePayload {
  student_id: string;
  fee_structure_id: string;
  collection_amount_paid: number;
  collection_discount?: number;
  collection_fine?: number;
  collection_balance?: number;
  collection_payment_mode: PaymentMode;
  collection_month?: string;
  collection_payment_date?: string;
  collection_remarks?: string;
}

export const feeService = {
  createStructure: (data: CreateFeeStructurePayload) =>
    api.post<ApiResponse<any>>("/fee/structure/create", data),

  listStructures: (params?: { class_id?: string; page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<any>>("/fee/structure/list", { params }),

  collect: (data: CollectFeePayload) =>
    api.post<ApiResponse<any>>("/fee/collect", data),

  getAllCollections: (params?: { page?: number; limit?: number; start_date?: string; end_date?: string }) =>
    api.get<PaginatedResponse<any>>("/fee/collections", { params }),

  getStudentFeeHistory: (studentId: string) =>
    api.get<ApiResponse<{ data: any[]; summary: { total_paid: number; total_fine: number } }>>(`/fee/student/${studentId}`),

  getStats: (params?: { month?: number; year?: number }) =>
    api.get<ApiResponse<{ total_collected: number; total_fine: number; total_discount: number; count: number }>>("/fee/stats", { params }),
};
```

---

## 13. Timetable Service — `src/services/timetable.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, WeekDay } from "../types";

export interface CreateSlotPayload {
  class_id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  timetable_day: WeekDay;
  timetable_start_time: string;  // "08:00"
  timetable_end_time: string;    // "08:45"
  timetable_period_no?: number;
  timetable_room?: string;
  timetable_session?: string;
}

export const timetableService = {
  create: (data: CreateSlotPayload) =>
    api.post<ApiResponse<any>>("/timetable/create", data),

  // grouped response: { data: [], grouped: { Monday: [], Tuesday: [] } }
  get: (params?: { class_id?: string; section_id?: string; teacher_id?: string; day?: WeekDay }) =>
    api.get<ApiResponse<{ data: any[]; grouped: Record<WeekDay, any[]> }>>("/timetable/", { params }),

  update: (id: string, data: Partial<CreateSlotPayload>) =>
    api.patch<ApiResponse<any>>(`/timetable/update/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/timetable/delete/${id}`),
};
```

---

## 14. Homework Service — `src/services/homework.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse } from "../types";

export interface CreateHomeworkPayload {
  class_id: string;
  section_id?: string;
  subject_id: string;
  teacher_id: string;
  homework_title: string;
  homework_description?: string;
  homework_submission_date: string;  // "YYYY-MM-DD"
  homework_attachments?: string[];
}

export const homeworkService = {
  create: (data: CreateHomeworkPayload) =>
    api.post<ApiResponse<any>>("/homework/create", data),

  list: (params?: { page?: number; limit?: number; search?: string; class_id?: string; section_id?: string; subject_id?: string }) =>
    api.get<PaginatedResponse<any>>("/homework/list", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/homework/${id}`),

  update: (id: string, data: Partial<CreateHomeworkPayload>) =>
    api.patch<ApiResponse<any>>(`/homework/update/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/homework/delete/${id}`),
};
```

---

## 15. Announcement & Event Services

### `src/services/announcement.service.ts`
```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse, AnnouncementTarget } from "../types";

export interface CreateAnnouncementPayload {
  announcement_title: string;
  announcement_content: string;
  announcement_target: AnnouncementTarget;
  announcement_class_ids?: string[];
  announcement_attachments?: string[];
  announcement_publish_date?: string;
  announcement_expiry_date?: string;
  announcement_is_published?: boolean;
}

export const announcementService = {
  create: (data: CreateAnnouncementPayload) =>
    api.post<ApiResponse<any>>("/announcement/create", data),

  list: (params?: { page?: number; limit?: number; search?: string; target?: AnnouncementTarget }) =>
    api.get<PaginatedResponse<any>>("/announcement/list", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/announcement/${id}`),

  update: (id: string, data: Partial<CreateAnnouncementPayload>) =>
    api.patch<ApiResponse<any>>(`/announcement/update/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/announcement/delete/${id}`),
};
```

### `src/services/event.service.ts`
```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse, ExamStatus } from "../types";

export interface CreateEventPayload {
  event_title: string;
  event_description?: string;
  event_type?: string;
  event_start_date: string;
  event_end_date?: string;
  event_venue?: string;
  event_attachments?: string[];
  event_status?: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
}

export const eventService = {
  create: (data: CreateEventPayload) =>
    api.post<ApiResponse<any>>("/event/create", data),

  list: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<PaginatedResponse<any>>("/event/list", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/event/${id}`),

  update: (id: string, data: Partial<CreateEventPayload>) =>
    api.patch<ApiResponse<any>>(`/event/update/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/event/delete/${id}`),
};
```

---

## 16. Leave Service — `src/services/leave.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse, LeaveType, LeaveStatus } from "../types";

export interface ApplyLeavePayload {
  leave_type: LeaveType;
  leave_from_date: string;  // "YYYY-MM-DD"
  leave_to_date: string;    // "YYYY-MM-DD"
  leave_reason: string;
  leave_document?: string;
}

export const leaveService = {
  apply: (data: ApplyLeavePayload) =>
    api.post<ApiResponse<any>>("/leave/apply", data),

  list: (params?: { page?: number; limit?: number; status?: LeaveStatus }) =>
    api.get<PaginatedResponse<any>>("/leave/list", { params }),

  getMyLeaves: () =>
    api.get<ApiResponse<any[]>>("/leave/my-leaves"),

  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/leave/${id}`),

  // action: "Approved" | "Rejected"
  action: (id: string, action: "Approved" | "Rejected", rejection_reason?: string) =>
    api.patch<ApiResponse<any>>(`/leave/action/${id}`, { action, rejection_reason }),
};
```

---

## 17. Salary Service — `src/services/salary.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse, EmployeeType } from "../types";

export interface GenerateSalaryPayload {
  employee_id: string;
  employee_type: EmployeeType;
  salary_month: string;      // "YYYY-MM" e.g. "2024-01"
  salary_basic: number;
  salary_allowances?: number;
  salary_deductions?: number;
  salary_bonus?: number;
  salary_fine?: number;
}

export const salaryService = {
  generate: (data: GenerateSalaryPayload) =>
    api.post<ApiResponse<any>>("/salary/generate", data),

  list: (params?: { page?: number; limit?: number; salary_month?: string; employee_type?: EmployeeType; status?: "Pending" | "Paid" }) =>
    api.get<PaginatedResponse<any>>("/salary/list", { params }),

  getEmployeeHistory: (employeeId: string) =>
    api.get<ApiResponse<any[]>>(`/salary/employee/${employeeId}`),

  pay: (id: string, data?: { salary_payment_mode?: "Cash" | "Bank Transfer" | "Cheque"; salary_remark?: string }) =>
    api.patch<ApiResponse<any>>(`/salary/pay/${id}`, data || {}),
};
```


---

## 18. Library Service — `src/services/library.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse, MemberType } from "../types";

export interface CreateBookPayload {
  book_title: string;
  book_author?: string;
  book_publisher?: string;
  book_isbn?: string;
  book_category?: string;
  book_subject?: string;
  book_edition?: string;
  book_language?: string;
  book_total_copies: number;
  book_available_copies: number;
  book_price?: number;
  book_rack_no?: string;
}

export const libraryService = {
  createBook: (data: CreateBookPayload) =>
    api.post<ApiResponse<any>>("/library/book/create", data),

  listBooks: (params?: { page?: number; limit?: number; search?: string; category?: string }) =>
    api.get<PaginatedResponse<any>>("/library/book/list", { params }),

  getBook: (id: string) =>
    api.get<ApiResponse<any>>(`/library/book/${id}`),

  updateBook: (id: string, data: Partial<CreateBookPayload>) =>
    api.patch<ApiResponse<any>>(`/library/book/update/${id}`, data),

  deleteBook: (id: string) =>
    api.delete<ApiResponse<null>>(`/library/book/delete/${id}`),

  issueBook: (data: { book_id: string; member_id: string; member_type: MemberType; due_date: string }) =>
    api.post<ApiResponse<any>>("/library/issue", data),

  returnBook: (issueId: string, fine_per_day?: number) =>
    api.patch<ApiResponse<any>>(`/library/return/${issueId}`, { fine_per_day }),

  getIssues: (params?: { page?: number; limit?: number; status?: "Issued" | "Returned" | "Overdue" }) =>
    api.get<PaginatedResponse<any>>("/library/issues", { params }),
};
```

---

## 19. Hostel Service — `src/services/hostel.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse, HostelType, RoomType } from "../types";

export const hostelService = {
  create: (data: { hostel_name: string; hostel_type: HostelType; hostel_capacity?: number; hostel_address?: string; hostel_warden_name?: string; hostel_warden_phone?: string }) =>
    api.post<ApiResponse<any>>("/hostel/create", data),

  list: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<any>>("/hostel/list", { params }),

  createRoom: (data: { hostel_id: string; room_no: string; room_type: RoomType; room_capacity: number; room_cost_per_month?: number }) =>
    api.post<ApiResponse<any>>("/hostel/room/create", data),

  getRooms: (hostelId: string) =>
    api.get<ApiResponse<any[]>>(`/hostel/room/${hostelId}`),

  allotRoom: (data: { hostel_id: string; room_id: string; student_id: string; allotment_date?: string }) =>
    api.post<ApiResponse<any>>("/hostel/allot", data),

  vacateRoom: (allotmentId: string) =>
    api.patch<ApiResponse<any>>(`/hostel/vacate/${allotmentId}`),
};
```

---

## 20. Transport Service — `src/services/transport.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse } from "../types";

export const transportService = {
  createVehicle: (data: { vehicle_no: string; vehicle_name?: string; vehicle_type?: string; vehicle_capacity?: number; vehicle_driver_name?: string; vehicle_driver_phone?: string; vehicle_driver_license?: string }) =>
    api.post<ApiResponse<any>>("/transport/vehicle/create", data),

  listVehicles: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<any>>("/transport/vehicle/list", { params }),

  createRoute: (data: { route_name: string; route_vehicle_id?: string; route_stops?: Array<{ stop_name: string; stop_distance?: number; stop_fare?: number }> }) =>
    api.post<ApiResponse<any>>("/transport/route/create", data),

  listRoutes: () =>
    api.get<ApiResponse<any[]>>("/transport/route/list"),

  assign: (data: { student_id: string; route_id: string; vehicle_id: string; pickup_stop?: string; drop_stop?: string; monthly_fare?: number }) =>
    api.post<ApiResponse<any>>("/transport/assign", data),

  getAssignments: (params?: { page?: number; limit?: number; route_id?: string }) =>
    api.get<PaginatedResponse<any>>("/transport/assignments", { params }),
};
```

---

## 21. Admission Service — `src/services/admission.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse, AdmissionStatus, Gender } from "../types";

export interface CreateAdmissionPayload {
  applicant_name: string;
  applicant_dob: string;
  applicant_gender: Gender;
  applicant_phone: string;
  applicant_email?: string;
  applicant_address?: string;
  admission_class_id?: string;
  admission_session?: string;
  father_name?: string;
  father_phone?: string;
  mother_name?: string;
  mother_phone?: string;
  previous_school?: string;
  previous_class?: string;
  admission_documents?: string[];
}

export const admissionService = {
  create: (data: CreateAdmissionPayload) =>
    api.post<ApiResponse<any>>("/admission/create", data),

  list: (params?: { page?: number; limit?: number; search?: string; status?: AdmissionStatus }) =>
    api.get<PaginatedResponse<any>>("/admission/list", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/admission/${id}`),

  updateStatus: (id: string, status: AdmissionStatus, notes?: string) =>
    api.patch<ApiResponse<any>>(`/admission/status/${id}`, { status, notes }),
};
```

---

## 22. Complaint Service — `src/services/complaint.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse, ComplaintStatus } from "../types";

export const complaintService = {
  raise: (data: { complaint_title: string; complaint_description: string; complaint_type?: string; complaint_against?: string; complaint_attachments?: string[] }) =>
    api.post<ApiResponse<any>>("/complaint/raise", data),

  list: (params?: { page?: number; limit?: number; status?: ComplaintStatus }) =>
    api.get<PaginatedResponse<any>>("/complaint/list", { params }),

  updateStatus: (id: string, status: ComplaintStatus, resolution_note?: string) =>
    api.patch<ApiResponse<any>>(`/complaint/status/${id}`, { status, resolution_note }),
};
```

---

## 23. Dashboard Service — `src/services/dashboard.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse } from "../types";

export interface DashboardStats {
  overview: {
    total_students: number;
    active_students: number;
    total_teachers: number;
    total_staff: number;
    total_classes: number;
  };
  attendance_today: {
    present: number;
    absent: number;
    total: number;
    percentage: string;
  };
  finance: {
    monthly_fee_collected: number;
  };
  alerts: {
    pending_leaves: number;
    open_complaints: number;
    pending_admissions: number;
    overdue_books: number;
  };
  upcoming_exams: any[];
  recent_announcements: any[];
}

export const dashboardService = {
  getStats: () =>
    api.get<ApiResponse<DashboardStats>>("/dashboard/stats"),
};
```

---

## 24. Role Service — `src/services/role.service.ts`

```typescript
import api from "../lib/api";
import { ApiResponse, PaginatedResponse } from "../types";

export interface CreateRolePayload {
  role_name: string;
  role_display_name: string;
  role_description: string;
  role_permissions: string[];
}

export const roleService = {
  create: (data: CreateRolePayload) =>
    api.post<ApiResponse<any>>("/role/add", data),

  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<any>>("/role/list", { params }),

  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/role/${id}`),

  update: (id: string, data: Partial<CreateRolePayload>) =>
    api.patch<ApiResponse<any>>(`/role/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/role/${id}`),
};
```


---

## 25. Complete Services Index — `src/services/index.ts`

```typescript
export { authService, getRedirectPath } from "./auth.service";
export { organizationService } from "./organization.service";
export { classService } from "./class.service";
export { sectionService } from "./section.service";
export { subjectService } from "./subject.service";
export { teacherService } from "./teacher.service";
export { studentService } from "./student.service";
export { staffService } from "./staff.service";
export { attendanceService } from "./attendance.service";
export { examService, markService } from "./exam.service";
export { feeService } from "./fee.service";
export { timetableService } from "./timetable.service";
export { homeworkService } from "./homework.service";
export { announcementService } from "./announcement.service";
export { eventService } from "./event.service";
export { leaveService } from "./leave.service";
export { salaryService } from "./salary.service";
export { libraryService } from "./library.service";
export { hostelService } from "./hostel.service";
export { transportService } from "./transport.service";
export { admissionService } from "./admission.service";
export { complaintService } from "./complaint.service";
export { dashboardService } from "./dashboard.service";
export { roleService } from "./role.service";
```

---

## 26. Usage Examples

### Register + Onboarding
```typescript
import { authService, getRedirectPath } from "../services";

// Step 1 — Register
const res = await authService.register({
  user_name: "Rahul Sharma",
  user_email: "rahul@gmail.com",
  user_phone: "9876543210",
  user_password: "Rahul@123",
  user_country: "India",
  user_business_type: "School",
});
// Show "Check your email" screen

// Step 2 — When user clicks email link
// URL: /verify-email?token=abc123
const token = new URLSearchParams(window.location.search).get("token");
const verifyRes = await authService.verifyEmail(token!);
if (!verifyRes.data.data.user_hasBusiness) {
  navigate("/setup-school");
}

// Step 3 — Setup school
const setupRes = await authService.setupOrganization({
  organization_name: "Delhi Public School",
  organization_phone: "0112345678",
  organization_email: "info@dps.edu.in",
  organization_country: "India",
});
navigate("/dashboard");
```

### Login with routing
```typescript
const { data } = await authService.login({ user_email, user_password });
navigate(getRedirectPath(data.data.user));
```

### Bulk academic setup (onboarding)
```typescript
await organizationService.bulkCreateStructure([
  {
    class_name: "Class 10", class_numeric: 10,
    sections: ["A", "B", "C"],
    subjects: [
      { subject_name: "Mathematics", subject_code: "MATH-10" },
      { subject_name: "Science",     subject_code: "SCI-10" },
      { subject_name: "English",     subject_code: "ENG-10" },
    ],
  },
  {
    class_name: "Class 11", class_numeric: 11,
    sections: ["A", "B"],
    subjects: [
      { subject_name: "Physics",   subject_code: "PHY-11" },
      { subject_name: "Chemistry", subject_code: "CHE-11" },
    ],
  },
]);
```

### Mark attendance
```typescript
await attendanceService.mark({
  class_id: "66cls",
  section_id: "66sec",
  attendance_date: "2024-01-15",
  attendance_records: students.map((s) => ({
    student_id: s._id,
    status: presentIds.includes(s._id) ? "Present" : "Absent",
  })),
});
```

### Collect fee
```typescript
await feeService.collect({
  student_id: "66stu",
  fee_structure_id: "66fee",
  collection_amount_paid: 3500,
  collection_payment_mode: "Cash",
  collection_month: "January 2024",
});
```

### Enter marks
```typescript
await markService.enter({
  exam_id: "66exam",
  subject_id: "66sub",
  class_id: "66cls",
  marks: students.map((s) => ({
    student_id: s._id,
    mark_obtained: marksMap[s._id],
    mark_full: 100,
    mark_pass: 33,
  })),
});
```

### Get result card
```typescript
const { data } = await markService.getResultCard(studentId, examId);
const { marks, summary } = data.data;
// summary.result === "Pass" | "Fail"
// summary.percentage === "88.50"
// summary.overall_grade === "A"
```

---

## 27. Error Handling Pattern

```typescript
import { AxiosError } from "axios";

const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Validation errors (422)
    if (error.response?.data?.errors) {
      return error.response.data.errors
        .map((e: any) => `${e.field}: ${e.message}`)
        .join(", ");
    }
    return error.response?.data?.message || "Something went wrong";
  }
  return "Network error";
};

// Usage in component / service call
try {
  await teacherService.create(payload);
} catch (err) {
  const message = handleApiError(err);
  toast.error(message);
}
```

---

## 28. HTTP Status → UI Action

| Status | Meaning | UI Action |
|--------|---------|-----------|
| `200` | OK | Show data |
| `201` | Created | Show success + navigate |
| `400` | Bad Request | Show error message |
| `401` | Unauthorized | Redirect to `/login` |
| `403` | Forbidden | Show "No permission" |
| `404` | Not Found | Show "Not found" |
| `409` | Conflict | Show "Already exists" |
| `422` | Validation | Show field errors from `errors[]` |
| `500` | Server Error | Show "Something went wrong" |

---

## 29. Folder Structure Suggestion

```
src/
├── lib/
│   └── api.ts              ← Axios instance
├── types/
│   └── index.ts            ← All TypeScript types
├── services/
│   ├── index.ts            ← Re-export all
│   ├── auth.service.ts
│   ├── organization.service.ts
│   ├── class.service.ts
│   ├── section.service.ts
│   ├── subject.service.ts
│   ├── teacher.service.ts
│   ├── student.service.ts
│   ├── staff.service.ts
│   ├── attendance.service.ts
│   ├── exam.service.ts
│   ├── fee.service.ts
│   ├── timetable.service.ts
│   ├── homework.service.ts
│   ├── announcement.service.ts
│   ├── event.service.ts
│   ├── leave.service.ts
│   ├── salary.service.ts
│   ├── library.service.ts
│   ├── hostel.service.ts
│   ├── transport.service.ts
│   ├── admission.service.ts
│   ├── complaint.service.ts
│   ├── dashboard.service.ts
│   └── role.service.ts
└── pages/
    ├── auth/
    │   ├── Login.tsx
    │   ├── Register.tsx
    │   ├── VerifyEmail.tsx
    │   └── SetupSchool.tsx
    └── dashboard/
        └── Dashboard.tsx
```
