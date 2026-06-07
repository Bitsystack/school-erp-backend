import { transporter } from "./mail.util";
import dotenv from "dotenv";
dotenv.config();

export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationUrl: string,
) => {
  await transporter.sendMail({
    from: `"School ERP" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: `
        <div style="font-family: Arial; max-width: 600px; margin:auto;">
          <h2>Welcome ${name}</h2>

          <p>
            Thank you for registering.
          </p>

          <p>
            Please verify your email by clicking the button below.
          </p>

          <a
            href="${verificationUrl}"
            style="
              background:#2563eb;
              color:white;
              padding:12px 24px;
              text-decoration:none;
              border-radius:6px;
            "
          >
            Verify Email
          </a>

          <p>
            This link will expire in 24 hours.
          </p>
        </div>
      `,
  });
};
