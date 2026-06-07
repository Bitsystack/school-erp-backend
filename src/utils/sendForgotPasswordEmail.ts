import { transporter } from "./mail.util";

export const sendForgotPasswordEmail = async (
  email: string,
  name: string,
  resetLink: string,
) => {
  await transporter.sendMail({
    to: email,
    subject: "Reset Password",
    html: `
    <h2>Hello ${name}</h2>

    <p>
      Click below link
      to reset password
    </p>

    <a href="${resetLink}">
      Reset Password
    </a>

    <p>
      Expires in 15 minutes
    </p>
   `,
  });
};
