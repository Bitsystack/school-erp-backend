/**
 * DB Seed Script
 * Run: npx ts-node src/seed.ts
 *
 * Creates all system roles and a default SUPER_ADMIN user.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/connection";
import { Role } from "./modules/roles/role.model";
import { User } from "./modules/users/user.model";

const SYSTEM_ROLES = [
  {
    role_name: "SUPER_ADMIN",
    role_display_name: "Super Admin",
    role_description: "Full system access — platform owner",
    role_level: 1,
    role_isSystemRole: true,
    role_permissions: ["*"],
  },
  {
    role_name: "ORGANIZATION_ADMIN",
    role_display_name: "Organization Admin",
    role_description: "Full access to own organization",
    role_level: 2,
    role_isSystemRole: true,
    role_permissions: [
      "org:read", "org:write",
      "teacher:read", "teacher:write", "teacher:delete",
      "student:read", "student:write", "student:delete",
      "staff:read", "staff:write", "staff:delete",
      "class:read", "class:write", "class:delete",
      "section:read", "section:write", "section:delete",
      "subject:read", "subject:write", "subject:delete",
      "attendance:read", "attendance:write",
      "exam:read", "exam:write", "exam:delete",
      "mark:read", "mark:write",
      "fee:read", "fee:write",
      "salary:read", "salary:write",
      "leave:read", "leave:write", "leave:approve",
      "homework:read", "homework:write",
      "library:read", "library:write",
      "hostel:read", "hostel:write",
      "transport:read", "transport:write",
      "announcement:read", "announcement:write",
      "event:read", "event:write",
      "complaint:read", "complaint:write",
      "admission:read", "admission:write",
      "timetable:read", "timetable:write",
      "dashboard:read",
    ],
  },
  {
    role_name: "TEACHER",
    role_display_name: "Teacher",
    role_description: "Teacher access — class management, marks, attendance",
    role_level: 3,
    role_isSystemRole: true,
    role_permissions: [
      "student:read",
      "class:read",
      "section:read",
      "subject:read",
      "attendance:read", "attendance:write",
      "mark:read", "mark:write",
      "homework:read", "homework:write",
      "timetable:read",
      "announcement:read",
      "event:read",
      "leave:read", "leave:write",
      "dashboard:read",
    ],
  },
  {
    role_name: "STUDENT",
    role_display_name: "Student",
    role_description: "Student access — view own data",
    role_level: 4,
    role_isSystemRole: true,
    role_permissions: [
      "student:read",
      "attendance:read",
      "mark:read",
      "homework:read",
      "timetable:read",
      "announcement:read",
      "event:read",
      "fee:read",
    ],
  },
  {
    role_name: "PARENT",
    role_display_name: "Parent",
    role_description: "Parent access — view child data",
    role_level: 5,
    role_isSystemRole: true,
    role_permissions: [
      "student:read",
      "attendance:read",
      "mark:read",
      "homework:read",
      "fee:read",
      "announcement:read",
      "event:read",
      "complaint:read", "complaint:write",
    ],
  },
  {
    role_name: "ACCOUNTANT",
    role_display_name: "Accountant",
    role_description: "Finance module access",
    role_level: 3,
    role_isSystemRole: true,
    role_permissions: [
      "fee:read", "fee:write",
      "salary:read", "salary:write",
      "student:read",
      "teacher:read",
      "staff:read",
      "dashboard:read",
    ],
  },
  {
    role_name: "LIBRARIAN",
    role_display_name: "Librarian",
    role_description: "Library module access",
    role_level: 3,
    role_isSystemRole: true,
    role_permissions: [
      "library:read", "library:write",
      "student:read",
      "teacher:read",
      "staff:read",
    ],
  },
  {
    role_name: "STAFF",
    role_display_name: "Staff",
    role_description: "General staff — limited access",
    role_level: 4,
    role_isSystemRole: true,
    role_permissions: [
      "announcement:read",
      "event:read",
      "leave:read", "leave:write",
    ],
  },
];

const seed = async () => {
  try {
    await connectDB();
    console.log("\n🌱 Starting seed...\n");

    // ── Seed Roles ──────────────────────────────────────────
    let createdCount = 0;
    let skippedCount = 0;

    for (const roleData of SYSTEM_ROLES) {
      const existing = await Role.findOne({ role_name: roleData.role_name });
      if (!existing) {
        await Role.create(roleData);
        console.log(`  ✅ Role created: ${roleData.role_name}`);
        createdCount++;
      } else {
        // Update permissions in case they changed
        await Role.findByIdAndUpdate(existing._id, {
          role_permissions: roleData.role_permissions,
          role_display_name: roleData.role_display_name,
          role_description: roleData.role_description,
        });
        console.log(`  ⏭️  Role exists (updated): ${roleData.role_name}`);
        skippedCount++;
      }
    }

    console.log(`\n  Roles → Created: ${createdCount}, Updated: ${skippedCount}\n`);

    // ── Seed Super Admin User ────────────────────────────────
    const superAdminRole = await Role.findOne({ role_name: "SUPER_ADMIN" });
    if (!superAdminRole) {
      throw new Error("SUPER_ADMIN role not found after seeding!");
    }

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@schoolerp.com";
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin@12345";

    const existingAdmin = await User.findOne({ user_email: superAdminEmail });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash(superAdminPassword, 12);
      await User.create({
        user_name: "Super Admin",
        user_email: superAdminEmail,
        user_phone: "9999999999",
        user_password: hashed,
        user_country: "India",
        user_business_type: "School",
        user_isEmailVerified: true,
        user_isActive: true,
        user_hasBusiness: false,
        user_role_id: superAdminRole._id.toString(),
        user_organization_id: "",
      });
      console.log(`  ✅ Super Admin created: ${superAdminEmail}`);
      console.log(`  🔑 Password: ${superAdminPassword}`);
    } else {
      console.log(`  ⏭️  Super Admin already exists: ${superAdminEmail}`);
    }

    console.log("\n🎉 Seed completed successfully!\n");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
