# School ERP — Complete Routes Reference

> Base URL: `http://localhost:5000/api/v1`  
> 🔒 = Auth required (accessToken cookie)  
> All list endpoints support: `?page=1&limit=10&search=keyword`

---

## AUTH `/api/v1/auth`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | ❌ | Register new account (Step 1) |
| GET | `/auth/verify-email?token=` | ❌ | Verify email + auto-login |
| POST | `/auth/resend-verification` | ❌ | Resend verification email |
| POST | `/auth/setup-organization` | 🔒 | Setup school details (Step 2) |
| POST | `/auth/login` | ❌ | Login |
| POST | `/auth/logout` | ❌ | Logout (clear cookies) |
| POST | `/auth/refresh-token` | ❌ | Refresh access token |
| POST | `/auth/forgot-password` | ❌ | Send reset link |
| POST | `/auth/reset-password` | ❌ | Reset with token |
| POST | `/auth/change-password` | 🔒 | Change password (logged-in) |

---

## USER `/api/v1/user`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/user/my-info` | 🔒 | Get my profile + org + role |

---

## ORGANIZATION `/api/v1/organization`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/organization/my-organization` | 🔒 | Get my organization details |
| GET | `/organization/overview` | 🔒 | Stats: classes, sections, subjects, teachers, students, staff counts |
| GET | `/organization/academic-structure` | 🔒 | Full tree: classes → sections + subjects |
| POST | `/organization/academic-structure/bulk` | 🔒 | Bulk create classes + sections + subjects |
| GET | `/organization/members` | 🔒 | All members `?role_type=teacher\|staff\|student` |
| POST | `/organization/create` | 🔒 | Create organization |
| PATCH | `/organization/update` | 🔒 | Update organization |
| DELETE | `/organization/delete` | 🔒 | Delete organization |
| POST | `/organization/logo` | 🔒 | Upload logo (multipart: `logo`) |
| GET | `/organization/organizations` | 🔒 | List all orgs (super admin) |
| GET | `/organization/organization/:id` | 🔒 | Get org by ID |

---

## ROLES `/api/v1/role`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/role/add` | 🔒 | Create role |
| GET | `/role/list` | 🔒 | List roles |
| GET | `/role/:id` | 🔒 | Get role by ID |
| PATCH | `/role/:id` | 🔒 | Update role |
| DELETE | `/role/:id` | 🔒 | Delete role (system roles protected) |

---

## CLASSES `/api/v1/class`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/class/create` | 🔒 | Create class |
| GET | `/class/list` | 🔒 | List classes |
| GET | `/class/:id` | 🔒 | Get class + sections + subjects + student count |
| GET | `/class/:id/students` | 🔒 | Students of a class `?section_id=` |
| PATCH | `/class/update/:id` | 🔒 | Update class |
| DELETE | `/class/delete/:id` | 🔒 | Delete class (blocked if students exist) |

---

## SECTIONS `/api/v1/section`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/section/create` | 🔒 | Create section |
| GET | `/section/list` | 🔒 | List sections `?class_id=` |
| GET | `/section/:id` | 🔒 | Get section (with class + teacher) |
| PATCH | `/section/update/:id` | 🔒 | Update section |
| DELETE | `/section/delete/:id` | 🔒 | Delete section |

---

## SUBJECTS `/api/v1/subject`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/subject/create` | 🔒 | Create subject |
| GET | `/subject/list` | 🔒 | List subjects `?class_id=` |
| GET | `/subject/:id` | 🔒 | Get subject (with class + teacher) |
| PATCH | `/subject/update/:id` | 🔒 | Update subject |
| DELETE | `/subject/delete/:id` | 🔒 | Delete subject |

---

## TEACHERS `/api/v1/teacher`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/teacher/create` | 🔒 | Create teacher (auto credentials) |
| GET | `/teacher/list` | 🔒 | List teachers `?pageSize=&search=` |
| GET | `/teacher/:id` | 🔒 | Get teacher (with user + role) |
| PATCH | `/teacher/update/:id` | 🔒 | Update teacher |
| PATCH | `/teacher/status/:id` | 🔒 | Toggle active/inactive |
| DELETE | `/teacher/delete/:id` | 🔒 | Soft delete |
| POST | `/teacher/add-image` | 🔒 | Upload photo (multipart: `image`) |

---

## STUDENTS `/api/v1/student`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/student/create` | 🔒 | Admit student (auto credentials) |
| GET | `/student/list` | 🔒 | List students `?class_id=&section_id=&status=` |
| GET | `/student/:id` | 🔒 | Get student (with class + section) |
| PATCH | `/student/update/:id` | 🔒 | Update student |
| PATCH | `/student/status/:id` | 🔒 | Toggle active/inactive |
| DELETE | `/student/delete/:id` | 🔒 | Soft delete |

---

## STAFF `/api/v1/staff`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/staff/create` | 🔒 | Create staff (auto credentials) |
| GET | `/staff/list` | 🔒 | List staff `?department=` |
| GET | `/staff/:id` | 🔒 | Get staff |
| PATCH | `/staff/update/:id` | 🔒 | Update staff |
| PATCH | `/staff/status/:id` | 🔒 | Toggle active/inactive |
| DELETE | `/staff/delete/:id` | 🔒 | Soft delete |

---

## ATTENDANCE `/api/v1/attendance`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/attendance/mark` | 🔒 | Mark bulk attendance |
| GET | `/attendance/by-date` | 🔒 | Get by date `?class_id=&section_id=&date=YYYY-MM-DD` |
| GET | `/attendance/student/:student_id` | 🔒 | Student history `?month=&year=` |
| GET | `/attendance/class-summary` | 🔒 | Class summary `?class_id=&section_id=&month=&year=` |

---

## EXAMS `/api/v1/exam`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/exam/create` | 🔒 | Create exam |
| GET | `/exam/list` | 🔒 | List exams `?class_id=&status=` |
| GET | `/exam/:id` | 🔒 | Get exam |
| PATCH | `/exam/update/:id` | 🔒 | Update exam |
| DELETE | `/exam/delete/:id` | 🔒 | Delete exam |

---

## MARKS `/api/v1/mark`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/mark/enter` | 🔒 | Bulk enter marks |
| GET | `/mark/by-exam` | 🔒 | Marks by exam `?exam_id=&subject_id=&class_id=` |
| GET | `/mark/student/:student_id` | 🔒 | Student marks `?exam_id=` |
| GET | `/mark/result/:student_id/:exam_id` | 🔒 | Full result card |
| PATCH | `/mark/update/:id` | 🔒 | Update single mark |

---

## FEES `/api/v1/fee`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/fee/structure/create` | 🔒 | Create fee structure |
| GET | `/fee/structure/list` | 🔒 | List fee structures `?class_id=` |
| POST | `/fee/collect` | 🔒 | Collect fee payment |
| GET | `/fee/collections` | 🔒 | All collections `?start_date=&end_date=` |
| GET | `/fee/student/:student_id` | 🔒 | Student fee history |
| GET | `/fee/stats` | 🔒 | Monthly stats `?month=&year=` |

---

## TIMETABLE `/api/v1/timetable`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/timetable/create` | 🔒 | Add timetable slot |
| GET | `/timetable/` | 🔒 | Get timetable `?class_id=&section_id=&teacher_id=&day=` |
| PATCH | `/timetable/update/:id` | 🔒 | Update slot |
| DELETE | `/timetable/delete/:id` | 🔒 | Delete slot |

---

## HOMEWORK `/api/v1/homework`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/homework/create` | 🔒 | Assign homework |
| GET | `/homework/list` | 🔒 | List `?class_id=&section_id=&subject_id=` |
| GET | `/homework/:id` | 🔒 | Get homework |
| PATCH | `/homework/update/:id` | 🔒 | Update homework |
| DELETE | `/homework/delete/:id` | 🔒 | Soft delete |

---

## ANNOUNCEMENTS `/api/v1/announcement`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/announcement/create` | 🔒 | Create announcement |
| GET | `/announcement/list` | 🔒 | List `?target=All\|Teachers\|Students\|Parents\|Staff` |
| GET | `/announcement/:id` | 🔒 | Get announcement |
| PATCH | `/announcement/update/:id` | 🔒 | Update |
| DELETE | `/announcement/delete/:id` | 🔒 | Delete |

---

## EVENTS `/api/v1/event`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/event/create` | 🔒 | Create event |
| GET | `/event/list` | 🔒 | List `?status=Upcoming\|Ongoing\|Completed\|Cancelled` |
| GET | `/event/:id` | 🔒 | Get event |
| PATCH | `/event/update/:id` | 🔒 | Update |
| DELETE | `/event/delete/:id` | 🔒 | Delete |

---

## LEAVES `/api/v1/leave`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/leave/apply` | 🔒 | Apply for leave |
| GET | `/leave/list` | 🔒 | All leaves `?status=Pending\|Approved\|Rejected` |
| GET | `/leave/my-leaves` | 🔒 | My own leaves |
| GET | `/leave/:id` | 🔒 | Get leave |
| PATCH | `/leave/action/:id` | 🔒 | Approve / Reject |

---

## SALARY `/api/v1/salary`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/salary/generate` | 🔒 | Generate salary slip |
| GET | `/salary/list` | 🔒 | List `?salary_month=&employee_type=&status=` |
| GET | `/salary/employee/:employee_id` | 🔒 | Employee salary history |
| PATCH | `/salary/pay/:id` | 🔒 | Mark salary as paid |

---

## LIBRARY `/api/v1/library`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/library/book/create` | 🔒 | Add book |
| GET | `/library/book/list` | 🔒 | List books `?category=` |
| GET | `/library/book/:id` | 🔒 | Get book |
| PATCH | `/library/book/update/:id` | 🔒 | Update book |
| DELETE | `/library/book/delete/:id` | 🔒 | Soft delete |
| POST | `/library/issue` | 🔒 | Issue book to member |
| PATCH | `/library/return/:issue_id` | 🔒 | Return book |
| GET | `/library/issues` | 🔒 | Active issues `?status=Issued\|Returned\|Overdue` |

---

## HOSTEL `/api/v1/hostel`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/hostel/create` | 🔒 | Create hostel |
| GET | `/hostel/list` | 🔒 | List hostels |
| POST | `/hostel/room/create` | 🔒 | Add room |
| GET | `/hostel/room/:hostel_id` | 🔒 | Rooms of hostel |
| POST | `/hostel/allot` | 🔒 | Allot room to student |
| PATCH | `/hostel/vacate/:id` | 🔒 | Vacate allotment |

---

## TRANSPORT `/api/v1/transport`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/transport/vehicle/create` | 🔒 | Add vehicle |
| GET | `/transport/vehicle/list` | 🔒 | List vehicles |
| POST | `/transport/route/create` | 🔒 | Create route |
| GET | `/transport/route/list` | 🔒 | List routes |
| POST | `/transport/assign` | 🔒 | Assign student to route |
| GET | `/transport/assignments` | 🔒 | All assignments `?route_id=` |

---

## ADMISSIONS `/api/v1/admission`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/admission/create` | 🔒 | New admission enquiry |
| GET | `/admission/list` | 🔒 | List `?status=Pending\|Approved\|Rejected\|Enrolled` |
| GET | `/admission/:id` | 🔒 | Get admission |
| PATCH | `/admission/status/:id` | 🔒 | Update status |

---

## COMPLAINTS `/api/v1/complaint`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/complaint/raise` | 🔒 | Raise complaint |
| GET | `/complaint/list` | 🔒 | List `?status=Open\|In Progress\|Resolved\|Closed` |
| PATCH | `/complaint/status/:id` | 🔒 | Update status |

---

## DASHBOARD `/api/v1/dashboard`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/dashboard/stats` | 🔒 | Full org stats (overview + attendance + finance + alerts) |

---

## Quick Payloads Reference

### POST `/auth/register`
```json
{ "user_name": "Rahul Sharma", "user_email": "rahul@gmail.com", "user_phone": "9876543210", "user_password": "Rahul@123", "user_country": "India", "user_business_type": "School" }
```

### POST `/auth/setup-organization` 🔒
```json
{ "organization_name": "Delhi Public School", "organization_phone": "0112345678", "organization_email": "info@dps.edu.in", "organization_country": "India", "organization_address": "Noida", "organization_pincode": "201301" }
```

### POST `/auth/login`
```json
{ "user_email": "rahul@gmail.com", "user_password": "Rahul@123" }
```

### POST `/organization/academic-structure/bulk` 🔒
```json
{
  "classes": [
    {
      "class_name": "Class 10",
      "class_numeric": 10,
      "section_capacity": 40,
      "sections": ["A", "B", "C"],
      "subjects": [
        { "subject_name": "Mathematics", "subject_code": "MATH-10", "subject_type": "Theory", "subject_full_marks": 100, "subject_pass_marks": 33 },
        { "subject_name": "Science", "subject_code": "SCI-10", "subject_type": "Theory" },
        { "subject_name": "English", "subject_code": "ENG-10" }
      ]
    },
    {
      "class_name": "Class 11",
      "class_numeric": 11,
      "sections": ["A", "B"],
      "subjects": [
        { "subject_name": "Physics", "subject_code": "PHY-11" },
        { "subject_name": "Chemistry", "subject_code": "CHE-11" }
      ]
    }
  ]
}
```

### POST `/class/create` 🔒
```json
{ "class_name": "Class 9", "class_numeric": 9, "class_description": "Secondary class" }
```

### POST `/section/create` 🔒
```json
{ "class_id": "66cls...", "section_name": "A", "section_capacity": 40, "section_class_teacher_id": "66tch..." }
```

### POST `/subject/create` 🔒
```json
{ "class_id": "66cls...", "subject_name": "Mathematics", "subject_code": "MATH-10", "subject_type": "Theory", "subject_teacher_id": "66tch...", "subject_full_marks": 100, "subject_pass_marks": 33 }
```

### POST `/teacher/create` 🔒
```json
{ "teacher_name": "Amit Kumar", "teacher_email": "amit@dps.edu.in", "teacher_phone": "9876543210", "teacher_gender": "Male", "teacher_qualification": "M.Sc", "teacher_experience": 5, "teacher_joining_date": "2024-01-01", "teacher_salary": 45000 }
```

### POST `/student/create` 🔒
```json
{ "student_name": "Priya Verma", "student_email": "priya@dps.edu.in", "student_phone": "9876500001", "student_gender": "Female", "student_dob": "2010-03-15", "student_class_id": "66cls...", "student_section_id": "66sec...", "student_session": "2024-25", "father_name": "Rajesh Verma", "father_phone": "9876500000" }
```

### POST `/staff/create` 🔒
```json
{ "staff_name": "Vikram Singh", "staff_email": "vikram@dps.edu.in", "staff_phone": "9876540001", "staff_gender": "Male", "staff_department": "Administration", "staff_designation": "Office Manager", "staff_salary": 25000 }
```

### POST `/attendance/mark` 🔒
```json
{ "class_id": "66cls...", "section_id": "66sec...", "attendance_date": "2024-01-15", "attendance_records": [ { "student_id": "66stu001", "status": "Present" }, { "student_id": "66stu002", "status": "Absent", "remark": "Sick" } ] }
```

### POST `/mark/enter` 🔒
```json
{ "exam_id": "66exam...", "subject_id": "66sub...", "class_id": "66cls...", "marks": [ { "student_id": "66stu001", "mark_obtained": 85, "mark_full": 100, "mark_pass": 33 } ] }
```

### POST `/fee/structure/create` 🔒
```json
{ "class_id": "66cls...", "fee_title": "Tuition Fee", "fee_amount": 3500, "fee_frequency": "Monthly", "fee_due_day": 10, "fee_session": "2024-25" }
```

### POST `/fee/collect` 🔒
```json
{ "student_id": "66stu...", "fee_structure_id": "66fee...", "collection_amount_paid": 3500, "collection_fine": 0, "collection_discount": 0, "collection_payment_mode": "Cash", "collection_month": "January 2024" }
```

### POST `/timetable/create` 🔒
```json
{ "class_id": "66cls...", "section_id": "66sec...", "subject_id": "66sub...", "teacher_id": "66tch...", "timetable_day": "Monday", "timetable_start_time": "08:00", "timetable_end_time": "08:45", "timetable_period_no": 1 }
```

### POST `/leave/apply` 🔒
```json
{ "leave_type": "Sick", "leave_from_date": "2024-01-20", "leave_to_date": "2024-01-22", "leave_reason": "Fever" }
```

### PATCH `/leave/action/:id` 🔒
```json
{ "action": "Approved" }
```
or
```json
{ "action": "Rejected", "rejection_reason": "Insufficient leave balance" }
```

### POST `/salary/generate` 🔒
```json
{ "employee_id": "66tch...", "employee_type": "Teacher", "salary_month": "2024-01", "salary_basic": 45000, "salary_allowances": 5000, "salary_deductions": 2000, "salary_bonus": 0, "salary_fine": 0 }
```

### POST `/library/issue` 🔒
```json
{ "book_id": "66book...", "member_id": "66stu...", "member_type": "Student", "due_date": "2024-02-15" }
```

### POST `/hostel/allot` 🔒
```json
{ "hostel_id": "66hst...", "room_id": "66room...", "student_id": "66stu...", "allotment_date": "2024-04-01" }
```

### POST `/transport/assign` 🔒
```json
{ "student_id": "66stu...", "route_id": "66rte...", "vehicle_id": "66veh...", "pickup_stop": "Sector 45", "monthly_fare": 500 }
```

### POST `/complaint/raise` 🔒
```json
{ "complaint_title": "AC not working", "complaint_description": "AC in Class 10A not working since 3 days.", "complaint_type": "Infrastructure" }
```

### PATCH `/complaint/status/:id` 🔒
```json
{ "status": "Resolved", "resolution_note": "AC repaired on 16 Jan 2024" }
```

### POST `/admission/create` 🔒
```json
{ "applicant_name": "Arjun Mehta", "applicant_dob": "2012-05-10", "applicant_gender": "Male", "applicant_phone": "9876509999", "admission_class_id": "66cls...", "admission_session": "2024-25", "father_name": "Rakesh Mehta", "father_phone": "9876508888" }
```

### PATCH `/admission/status/:id` 🔒
```json
{ "status": "Approved", "notes": "Documents verified" }
```

---

## Enums Quick Reference

```
user_business_type  : "School" | "College" | "Coaching" | "University" | "Other"
teacher_gender      : "Male" | "Female" | "Other"
student_gender      : "Male" | "Female" | "Other"
staff_gender        : "Male" | "Female" | "Other"
subject_type        : "Theory" | "Practical" | "Both"
attendance_status   : "Present" | "Absent" | "Late" | "Leave"
exam_status         : "Upcoming" | "Ongoing" | "Completed" | "Cancelled"
fee_frequency       : "Monthly" | "Quarterly" | "Annually" | "OneTime"
payment_mode        : "Cash" | "Online" | "Cheque" | "Bank Transfer"
timetable_day       : "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
leave_type          : "Sick" | "Casual" | "Earned" | "Maternity" | "Other"
leave_status        : "Pending" | "Approved" | "Rejected"
salary_payment_mode : "Cash" | "Bank Transfer" | "Cheque"
employee_type       : "Teacher" | "Staff"
announcement_target : "All" | "Teachers" | "Students" | "Parents" | "Staff"
event_status        : "Upcoming" | "Ongoing" | "Completed" | "Cancelled"
hostel_type         : "Boys" | "Girls" | "Mixed"
room_type           : "Single" | "Double" | "Triple" | "Dormitory"
member_type         : "Student" | "Teacher" | "Staff"
complaint_status    : "Open" | "In Progress" | "Resolved" | "Closed"
admission_status    : "Pending" | "Approved" | "Rejected" | "Enrolled"
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (missing field, room full, already processed) |
| 401 | Unauthorized (no token, expired) |
| 403 | Forbidden (deactivated, email not verified) |
| 404 | Not Found |
| 409 | Conflict (duplicate email, already exists) |
| 422 | Validation Failed (check `errors[]`) |
| 500 | Server Error |

---

## Total: 78 Routes across 26 modules
