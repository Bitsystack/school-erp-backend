// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// export const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   service: "gmail",
//   port: Number(process.env.SMTP_PORT),
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail", // host ki zarurat nahi hai jab service use kar rahe ho
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ SMTP connection verify
(async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP Connected Successfully");
  } catch (error) {
    console.error("❌ SMTP Verify Error:", error);
  }
})();
