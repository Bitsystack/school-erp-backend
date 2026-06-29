# School ERP — Frontend Integration Guide

> **Base URL:** `http://localhost:5000/api/v1`  
> **Production:** Set `VITE_API_URL` in your frontend `.env`

---

## Table of Contents
1. [Setup & Config](#1-setup--config)
2. [Authentication Flow](#2-authentication-flow)
3. [Axios Instance & Interceptors](#3-axios-instance--interceptors)
4. [Auth APIs](#4-auth-apis)
5. [Organization APIs](#5-organization-apis)
6. [Class, Section, Subject APIs](#6-class-section-subject-apis)
7. [Teacher APIs](#7-teacher-apis)
8. [Student APIs](#8-student-apis)
9. [Staff APIs](#9-staff-apis)
10. [Attendance APIs](#10-attendance-apis)
11. [Exam & Marks APIs](#11-exam--marks-apis)
12. [Fee APIs](#12-fee-apis)
13. [Timetable APIs](#13-timetable-apis)
14. [Homework APIs](#14-homework-apis)
15. [Announcements & Events APIs](#15-announcements--events-apis)
16. [Leave APIs](#16-leave-apis)
17. [Salary APIs](#17-salary-apis)
18. [Library APIs](#18-library-apis)
19. [Hostel APIs](#19-hostel-apis)
20. [Transport APIs](#20-transport-apis)
21. [Admission APIs](#21-admission-apis)
22. [Complaint APIs](#22-complaint-apis)
23. [Dashboard API](#23-dashboard-api)
24. [Error Handling Reference](#24-error-handling-reference)
25. [Role & Permissions Reference](#25-role--permissions-reference)

---

## 1. Setup & Config

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Important Notes
- All requests use **HTTP-only cookies** (no localStorage tokens needed)
- Set `withCredentials: true` on every request
- `Content-Type: application/json` for all JSON requests
- `Content-Type: multipart/form-data` for file uploads

---

## 2. Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     NEW USER JOURNEY                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Landing Page                                               │
│      │                                                      │
│      ▼                                                      │
│  POST /auth/register  ──► Email sent ──► Check inbox        │
│                                              │              │
│      ┌───────────────────────────────────────┘              │
│      ▼                                                      │
│  GET /auth/verify-email?token=xxx                           │
│      │  (auto-login cookies set)                            │
│      ▼                                                      │
│  Response: { user_hasBusiness: false }                      │
│      │                                                      │
│      ▼                                                      │
│  /setup-school page                                         │
│      │                                                      │
│      ▼                                                      │
│  POST /auth/setup-organization                              │
│      │  (tokens refreshed with organizationId)              │
│      ▼                                                      │
│  /dashboard ✅                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  RETURNING USER JOURNEY                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  POST /auth/login                                           │
│      │                                                      │
│      ├── user_isEmailVerified = false  ──► /verify-email    │
│      ├── user_hasBusiness = false      ──► /setup-school    │
│      └── both true                    ──► /dashboard ✅     │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Route Guard Logic
```typescript
// In your router guard / middleware
const routeGuard = (user: User) => {
  if (!user.user_isEmailVerified) return '/verify-email'
  if (!user.user_hasBusiness)     return '/setup-school'
  return '/dashboard'
}
```

---

## 3. Axios Instance & Interceptors

```typescript
// lib/axios.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,          // REQUIRED — sends cookies
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor (optional logging) ──────────────────
api.interceptors.request.use((config) => {
  return config
})

// ── Response interceptor — auto refresh on 401 ───────────────
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve())
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(originalRequest))
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.post('/auth/refresh-token')
        processQueue(null)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        // Refresh failed — redirect to login
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
```

---

## 4. Auth APIs

### 4.1 Register
```
POST /auth/register
```
**Request Body:**
```json
{
  "user_name": "Rahul Sharma",
  "user_email": "rahul@gmail.com",
  "user_phone": "9876543210",
  "user_password": "Rahul@123",
  "user_country": "India",
  "user_business_type": "School"
}
```
> `user_business_type` enum: `"School" | "College" | "Coaching" | "University" | "Other"`  
> Password rules: min 8 chars, 1 uppercase, 1 number

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Account created! Please check your email to verify your account.",
  "data": {
    "user_id": "66abc123...",
    "user_email": "rahul@gmail.com",
    "user_isEmailVerified": false,
    "user_hasBusiness": false
  }
}
```
**Error Responses:**
```json
// 409 — Email already exists
{ "success": false, "message": "An account with this email already exists" }

// 422 — Validation failed
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "user_password", "message": "Must contain at least one number" }]
}
```

---

### 4.2 Verify Email
```
GET /auth/verify-email?token=TOKEN_FROM_EMAIL
```
> No body needed. Token comes from email link query param.

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "data": {
    "user_id": "66abc123...",
    "user_hasBusiness": false
  }
}
```
> Cookies `accessToken` + `refreshToken` are set automatically.  
> If `user_hasBusiness: false` → redirect to `/setup-school`

**Error Response `400`:**
```json
{ "success": false, "message": "Invalid or expired verification link. Please request a new one." }
```

---

### 4.3 Resend Verification Email
```
POST /auth/resend-verification
```
**Request Body:**
```json
{ "user_email": "rahul@gmail.com" }
```
**Response `200`:**
```json
{ "success": true, "message": "Verification email resent successfully" }
```

---

### 4.4 Setup Organization (Onboarding Step 2)
```
POST /auth/setup-organization
```
> 🔒 Auth required (cookies from verify-email step)

**Request Body:**
```json
{
  "organization_name": "Delhi Public School",
  "organization_phone": "0112345678",
  "organization_email": "info@dps.edu.in",
  "organization_country": "India",
  "organization_address": "Sector 45, Noida",
  "organization_pincode": "201301",
  "organization_website": "https://dps.edu.in",
  "organization_whatsapp": "9876543210",
  "organization_gstin": "29ABCDE1234F1Z5"
}
```
> All fields except name, phone, email, country are optional.

**Success Response `201`:**
```json
{
  "success": true,
  "message": "School setup complete! Welcome to your dashboard.",
  "data": {
    "organization": {
      "_id": "66xyz...",
      "organization_name": "Delhi Public School",
      "organization_email": "info@dps.edu.in",
      "organization_phone": "0112345678",
      "organization_country": "India",
      "organization_owner_id": "66abc123..."
    },
    "user": {
      "_id": "66abc123...",
      "user_name": "Rahul Sharma",
      "user_email": "rahul@gmail.com",
      "user_hasBusiness": true,
      "user_organization_id": "66xyz...",
      "role": {
        "_id": "...",
        "role_name": "ORGANIZATION_ADMIN",
        "role_display_name": "Organization Admin",
        "role_permissions": ["teacher:read", "teacher:write", "..."]
      },
      "organization": { "...full org object" }
    }
  }
}
```
> New tokens issued with `organizationId` — frontend redirects to `/dashboard`

---

### 4.5 Login
```
POST /auth/login
```
**Request Body:**
```json
{ "user_email": "rahul@gmail.com", "user_password": "Rahul@123" }
```
**Success Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "66abc123...",
      "user_name": "Rahul Sharma",
      "user_email": "rahul@gmail.com",
      "user_phone": "9876543210",
      "user_country": "India",
      "user_business_type": "School",
      "user_isEmailVerified": true,
      "user_isActive": true,
      "user_hasBusiness": true,
      "user_organization_id": "66xyz...",
      "user_lastLogin": "2024-01-15T10:30:00.000Z",
      "role": {
        "_id": "...",
        "role_name": "ORGANIZATION_ADMIN",
        "role_display_name": "Organization Admin",
        "role_permissions": ["teacher:read", "teacher:write", "..."]
      },
      "organization": {
        "_id": "66xyz...",
        "organization_name": "Delhi Public School",
        "organization_logo": "https://cloudinary.com/..."
      }
    }
  }
}
```
**Error Responses:**
```json
// 401
{ "success": false, "message": "Invalid email or password" }
// 403
{ "success": false, "message": "Your account has been deactivated. Please contact support." }
```

---

### 4.6 Logout
```
POST /auth/logout
```
> Clears `accessToken` and `refreshToken` cookies.

**Response `200`:**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### 4.7 Forgot Password
```
POST /auth/forgot-password
```
**Request Body:**
```json
{ "user_email": "rahul@gmail.com" }
```
**Response `200`:**
```json
{ "success": true, "message": "If this email is registered, a reset link has been sent." }
```
> Always returns 200 — never reveals if email exists (security)

---

### 4.8 Reset Password
```
POST /auth/reset-password
```
**Request Body:**
```json
{ "token": "TOKEN_FROM_EMAIL_LINK", "password": "NewPass@456" }
```
**Success `200`:**
```json
{ "success": true, "message": "Password updated successfully. You can now login." }
```
**Error `400`:**
```json
{ "success": false, "message": "Reset link is invalid or has expired. Please request a new one." }
```

---

### 4.9 Change Password (logged-in user)
```
POST /auth/change-password
```
> 🔒 Auth required

**Request Body:**
```json
{ "current_password": "OldPass@123", "new_password": "NewPass@456" }
```
**Success `200`:**
```json
{ "success": true, "message": "Password changed successfully. Please login again." }
```
> Session cleared — user must re-login.

---

### 4.10 Get My Profile
```
GET /user/my-info
```
> 🔒 Auth required

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": { "...full user object without password" },
    "organization": { "...org details or {}" },
    "role": { "...role with permissions or {}" }
  }
}
```

---

## 5. Organization APIs

> 🔒 All routes require Auth

### 5.1 Get My Organization
```
GET /organization/organization/:id
```
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "_id": "66xyz...",
    "organization_name": "Delhi Public School",
    "organization_email": "info@dps.edu.in",
    "organization_phone": "0112345678",
    "organization_whatsapp": "9876543210",
    "organization_website": "https://dps.edu.in",
    "organization_country": "India",
    "organization_address": "Sector 45, Noida",
    "organization_pincode": "201301",
    "organization_gstin": "29ABCDE1234F1Z5",
    "organization_logo": "https://res.cloudinary.com/...",
    "owner": {
      "_id": "...",
      "user_name": "Rahul Sharma",
      "user_email": "rahul@gmail.com"
    },
    "createdAt": "2024-01-10T08:00:00.000Z"
  }
}
```

### 5.2 Update Organization
```
PATCH /organization/update
```
**Request Body (all optional):**
```json
{
  "organization_name": "Delhi Public School - Main Branch",
  "organization_phone": "0119876543",
  "organization_address": "Block A, Sector 45, Noida",
  "organization_website": "https://dps.edu.in",
  "organization_upi_id": "dps@okaxis"
}
```

### 5.3 Upload Organization Logo
```
POST /organization/logo
Content-Type: multipart/form-data
```
**Form Data:**
```
logo: <File>   (max 5MB, image/*)
```
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/your_cloud/image/upload/v123/organizations/abc.jpg",
    "public_id": "organizations/abc"
  }
}
```
> After getting `url`, call `PATCH /organization/update` with `{ organization_logo: url }`

---

## 6. Class, Section, Subject APIs

> 🔒 All routes require Auth  
> All data auto-scoped to logged-in user's organization

### 6.1 Classes

#### Create Class
```
POST /class/create
```
```json
{
  "class_name": "Class 10",
  "class_numeric": 10,
  "class_description": "Secondary class"
}
```

#### List Classes
```
GET /class/list?page=1&limit=50&search=10
```
**Response:**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "class_name": "Class 10", "class_numeric": 10, "class_status": true }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 12, "totalPages": 1 }
}
```

#### Update / Delete
```
PATCH /class/update/:id   Body: { "class_name": "Class X" }
DELETE /class/delete/:id
```

---

### 6.2 Sections

#### Create Section
```
POST /section/create
```
```json
{
  "class_id": "66abc...",
  "section_name": "A",
  "section_capacity": 40,
  "section_class_teacher_id": "66teacher..."
}
```

#### List Sections (filter by class)
```
GET /section/list?class_id=66abc...&page=1&limit=20
```
**Response includes populated class and teacher:**
```json
{
  "data": [
    {
      "_id": "...",
      "section_name": "A",
      "section_capacity": 40,
      "class_id": { "_id": "...", "class_name": "Class 10" },
      "section_class_teacher_id": { "_id": "...", "teacher_name": "Amit Sir" }
    }
  ]
}
```

---

### 6.3 Subjects

#### Create Subject
```
POST /subject/create
```
```json
{
  "class_id": "66abc...",
  "subject_name": "Mathematics",
  "subject_code": "MATH-10",
  "subject_type": "Theory",
  "subject_teacher_id": "66teacher...",
  "subject_full_marks": 100,
  "subject_pass_marks": 33
}
```
> `subject_type` enum: `"Theory" | "Practical" | "Both"`

#### List Subjects (filter by class)
```
GET /subject/list?class_id=66abc...&search=math
```

---

## 7. Teacher APIs

> 🔒 All routes require Auth

### 7.1 Create Teacher
```
POST /teacher/create
```
> Auto-creates a user account with login credentials. Credentials returned in response.

**Request Body:**
```json
{
  "teacher_name": "Amit Kumar",
  "teacher_email": "amit.kumar@dps.edu.in",
  "teacher_phone": "9876543210",
  "teacher_gender": "Male",
  "teacher_qualification": "M.Sc Mathematics",
  "teacher_experience": 5,
  "teacher_joining_date": "2024-01-01",
  "teacher_salary": 45000,
  "teacher_address": "Noida, UP",
  "teacher_dob": "1990-05-15",
  "teacher_country": "India"
}
```
> `teacher_gender` enum: `"Male" | "Female" | "Other"`

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Teacher created successfully",
  "data": {
    "_id": "66tch...",
    "teacher_employee_id": "DPS-TCH-0001",
    "teacher_name": "Amit Kumar",
    "teacher_email": "amit.kumar@dps.edu.in",
    "teacher_status": true
  },
  "credentials": {
    "email": "amit.kumar@dps.edu.in",
    "password": "Teacher@4521"
  }
}
```
> ⚠️ Show credentials to admin once — store or share with teacher manually.

---

### 7.2 List Teachers
```
GET /teacher/list?page=1&pageSize=10&search=amit
```

---

### 7.3 Get Teacher by ID
```
GET /teacher/:id
```
**Response includes user + role info:**
```json
{
  "data": {
    "_id": "...",
    "teacher_employee_id": "DPS-TCH-0001",
    "teacher_name": "Amit Kumar",
    "teacher_email": "amit.kumar@dps.edu.in",
    "teacher_phone": "9876543210",
    "teacher_gender": "Male",
    "teacher_joining_date": "2024-01-01T00:00:00.000Z",
    "teacher_salary": 45000,
    "teacher_status": true,
    "user": { "_id": "...", "user_isActive": true, "user_lastLogin": "..." },
    "role": { "role_name": "TEACHER", "role_display_name": "Teacher" }
  }
}
```

---

### 7.4 Update Teacher
```
PATCH /teacher/update/:id
```
```json
{
  "teacher_phone": "9999999999",
  "teacher_salary": 50000,
  "teacher_address": "Delhi"
}
```

### 7.5 Toggle Status
```
PATCH /teacher/status/:id
```
> No body needed. Toggles active/inactive.

**Response:**
```json
{ "data": { "teacher_status": false } }
```

### 7.6 Upload Teacher Photo
```
POST /teacher/add-image
Content-Type: multipart/form-data
```
```
image: <File>
```
**Response:**
```json
{ "data": { "url": "https://res.cloudinary.com/...", "public_id": "teacher/abc" } }
```
> Then call `PATCH /teacher/update/:id` with `{ "teacher_photo": url }`

---

## 8. Student APIs

> 🔒 All routes require Auth

### 8.1 Create Student (Admission)
```
POST /student/create
```
> Auto-creates user + login credentials. Auto-generates admission number.

**Request Body:**
```json
{
  "student_name": "Priya Verma",
  "student_email": "priya.verma@dps.edu.in",
  "student_phone": "9876500001",
  "student_gender": "Female",
  "student_dob": "2010-03-15",
  "student_blood_group": "O+",
  "student_religion": "Hindu",
  "student_category": "General",
  "student_address": "B-12, Sector 45",
  "student_city": "Noida",
  "student_state": "Uttar Pradesh",
  "student_pincode": "201301",
  "student_class_id": "66cls...",
  "student_section_id": "66sec...",
  "student_session": "2024-25",
  "student_admission_date": "2024-04-01",
  "father_name": "Rajesh Verma",
  "father_phone": "9876500000",
  "father_occupation": "Engineer",
  "mother_name": "Sunita Verma",
  "mother_phone": "9876500002",
  "mother_occupation": "Teacher",
  "guardian_name": "",
  "guardian_phone": "",
  "guardian_relation": ""
}
```
> `student_gender` enum: `"Male" | "Female" | "Other"`

**Success Response `201`:**
```json
{
  "success": true,
  "data": {
    "_id": "66stu...",
    "student_admission_no": "DPS-STU-240001",
    "student_name": "Priya Verma",
    "student_class_id": "66cls...",
    "student_status": true
  },
  "credentials": {
    "email": "priya.verma@dps.edu.in",
    "password": "Student@3842"
  }
}
```

---

### 8.2 List Students
```
GET /student/list?page=1&limit=20&class_id=66cls...&section_id=66sec...&status=true&search=priya
```
**Response includes populated class + section:**
```json
{
  "data": [
    {
      "_id": "...",
      "student_admission_no": "DPS-STU-240001",
      "student_name": "Priya Verma",
      "student_gender": "Female",
      "student_status": true,
      "student_class_id": { "class_name": "Class 10", "class_numeric": 10 },
      "student_section_id": { "section_name": "A" }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 85, "totalPages": 5 }
}
```

---

### 8.3 Get Student by ID
```
GET /student/:id
```

### 8.4 Update Student
```
PATCH /student/update/:id
```
> Send only fields you want to update.

### 8.5 Toggle Status
```
PATCH /student/status/:id
```

---

## 9. Staff APIs

> Same pattern as Teacher. 🔒 Auth required.

### Create Staff
```
POST /staff/create
```
```json
{
  "staff_name": "Vikram Singh",
  "staff_email": "vikram@dps.edu.in",
  "staff_phone": "9876540001",
  "staff_gender": "Male",
  "staff_department": "Administration",
  "staff_designation": "Office Manager",
  "staff_qualification": "B.Com",
  "staff_experience": 3,
  "staff_joining_date": "2024-02-01",
  "staff_salary": 25000,
  "staff_address": "Delhi"
}
```
> Auto-creates user with role `STAFF`. Returns credentials.

### Other Endpoints
```
GET    /staff/list?page=1&limit=10&department=Administration
GET    /staff/:id
PATCH  /staff/update/:id
PATCH  /staff/status/:id    ← toggle active/inactive
DELETE /staff/delete/:id    ← soft delete
```

---

## 10. Attendance APIs

> 🔒 Auth required

### 10.1 Mark Attendance (Bulk)
```
POST /attendance/mark
```
**Request Body:**
```json
{
  "class_id": "66cls...",
  "section_id": "66sec...",
  "attendance_date": "2024-01-15",
  "attendance_records": [
    { "student_id": "66stu001...", "status": "Present", "remark": "" },
    { "student_id": "66stu002...", "status": "Absent",  "remark": "Sick" },
    { "student_id": "66stu003...", "status": "Late",    "remark": "Bus delay" },
    { "student_id": "66stu004...", "status": "Leave",   "remark": "Approved leave" }
  ]
}
```
> `status` enum: `"Present" | "Absent" | "Late" | "Leave"`  
> Uses upsert — calling again on same date overwrites.

**Response `200`:**
```json
{ "success": true, "message": "Attendance marked successfully" }
```

---

### 10.2 Get Attendance by Date
```
GET /attendance/by-date?class_id=66cls...&section_id=66sec...&date=2024-01-15
```
**Response:**
```json
{
  "data": [
    {
      "_id": "...",
      "attendance_date": "2024-01-15T00:00:00.000Z",
      "attendance_status": "Present",
      "student_id": {
        "_id": "66stu001...",
        "student_name": "Priya Verma",
        "student_admission_no": "DPS-STU-240001",
        "student_photo": "https://..."
      }
    }
  ]
}
```

---

### 10.3 Student Attendance History
```
GET /attendance/student/:student_id?month=1&year=2024
```
**Response:**
```json
{
  "data": [ { "attendance_date": "...", "attendance_status": "Present" } ],
  "summary": {
    "total": 22, "present": 20, "absent": 1, "late": 1, "leave": 0
  }
}
```

---

### 10.4 Class Attendance Summary
```
GET /attendance/class-summary?class_id=66cls...&section_id=66sec...&month=1&year=2024
```
**Response:**
```json
{
  "data": [
    {
      "_id": "66stu001...",
      "student_name": "Priya Verma",
      "student_admission_no": "DPS-STU-240001",
      "total": 22, "present": 20, "absent": 2, "late": 0,
      "percentage": 90.91
    }
  ]
}
```

---

## 11. Exam & Marks APIs

> 🔒 Auth required

### 11.1 Create Exam
```
POST /exam/create
```
```json
{
  "class_id": "66cls...",
  "exam_name": "Half Yearly Exam",
  "exam_term": "Term 1",
  "exam_session": "2024-25",
  "exam_start_date": "2024-09-01",
  "exam_end_date": "2024-09-10",
  "exam_description": "First half yearly examination"
}
```
> `exam_status` default: `"Upcoming"`. Enum: `"Upcoming" | "Ongoing" | "Completed" | "Cancelled"`

### 11.2 List Exams
```
GET /exam/list?class_id=66cls...&status=Upcoming&page=1&limit=10
```

---

### 11.3 Enter Marks (Bulk Upsert)
```
POST /mark/enter
```
**Request Body:**
```json
{
  "exam_id": "66exam...",
  "subject_id": "66sub...",
  "class_id": "66cls...",
  "marks": [
    { "student_id": "66stu001...", "mark_obtained": 85, "mark_full": 100, "mark_pass": 33 },
    { "student_id": "66stu002...", "mark_obtained": 42, "mark_full": 100, "mark_pass": 33 },
    { "student_id": "66stu003...", "mark_obtained": 30, "mark_full": 100, "mark_pass": 33, "mark_remark": "Needs improvement" }
  ]
}
```
> Grade auto-calculated server-side (A+, A, B+, B, C+, C, D, F)

**Response `200`:**
```json
{ "success": true, "message": "Marks saved successfully" }
```

---

### 11.4 Get Result Card
```
GET /mark/result/:student_id/:exam_id
```
**Response:**
```json
{
  "data": {
    "marks": [
      {
        "subject_id": { "subject_name": "Mathematics", "subject_code": "MATH-10" },
        "mark_obtained": 85, "mark_full": 100, "mark_pass": 33,
        "mark_grade": "A", "mark_remark": ""
      },
      {
        "subject_id": { "subject_name": "Science" },
        "mark_obtained": 92, "mark_full": 100, "mark_pass": 33,
        "mark_grade": "A+"
      }
    ],
    "summary": {
      "total_obtained": 177,
      "total_full": 200,
      "percentage": "88.50",
      "overall_grade": "A",
      "result": "Pass"
    }
  }
}
```

---

### 11.5 Get Marks by Exam (for a subject)
```
GET /mark/by-exam?exam_id=66exam...&subject_id=66sub...&class_id=66cls...
```

### 11.6 Get Student All Marks
```
GET /mark/student/:student_id?exam_id=66exam...
```

---

## 12. Fee APIs

> 🔒 Auth required

### 12.1 Create Fee Structure
```
POST /fee/structure/create
```
```json
{
  "class_id": "66cls...",
  "fee_title": "Tuition Fee",
  "fee_description": "Monthly tuition charges",
  "fee_amount": 3500,
  "fee_frequency": "Monthly",
  "fee_due_day": 10,
  "fee_session": "2024-25"
}
```
> `fee_frequency` enum: `"Monthly" | "Quarterly" | "Annually" | "OneTime"`

### 12.2 List Fee Structures
```
GET /fee/structure/list?class_id=66cls...&page=1&limit=20
```

---

### 12.3 Collect Fee Payment
```
POST /fee/collect
```
```json
{
  "student_id": "66stu...",
  "fee_structure_id": "66fee...",
  "collection_amount_paid": 3500,
  "collection_discount": 0,
  "collection_fine": 50,
  "collection_payment_mode": "Cash",
  "collection_month": "January 2024",
  "collection_remarks": "Paid with late fine"
}
```
> `collection_payment_mode` enum: `"Cash" | "Online" | "Cheque" | "Bank Transfer"`  
> `collection_receipt_no` auto-generated server-side

**Response `201`:**
```json
{
  "data": {
    "_id": "...",
    "collection_receipt_no": "RCP-0001-123456",
    "collection_amount_paid": 3500,
    "collection_total_amount": 3550,
    "collection_payment_mode": "Cash",
    "collection_payment_date": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### 12.4 Student Fee History
```
GET /fee/student/:student_id
```
**Response:**
```json
{
  "data": [ { "collection_receipt_no": "RCP-0001-...", "collection_amount_paid": 3500, "..." } ],
  "summary": { "total_paid": 42000, "total_fine": 100 }
}
```

### 12.5 All Collections
```
GET /fee/collections?page=1&limit=20&start_date=2024-01-01&end_date=2024-01-31
```

### 12.6 Fee Stats (Monthly)
```
GET /fee/stats?month=1&year=2024
```
**Response:**
```json
{
  "data": {
    "total_collected": 350000,
    "total_fine": 2500,
    "total_discount": 5000,
    "total_balance": 12000,
    "count": 95
  }
}
```

---
