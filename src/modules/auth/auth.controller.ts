import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { User } from "../users/user.model";
import { registerSchema, loginSchema } from "./auth.validation";
import { generateTokens } from "../../utils/generateToken";

export const Register = async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);
  const { user_email, user_password, ...rest } = validatedData;
  try {
    const existingUser = await User.findOne({ user_email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(user_password, 10);

    const user = await User.create({
      ...rest,
      user_email,
      user_password: hashedPassword,
      user_isEmailVerified: false,
      user_isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

export const Login = async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);
  const { user_email, user_password } = validatedData;
  try {
    const user = await User.findOne({ user_email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email",
      });
    }

    const isPasswordMatched = await bcrypt.compare(
      user_password,
      user.user_password,
    );

    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    if (!user.user_isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    const payload = {
      userId: user._id.toString(),
      organizationId: user.user_organization_id || "",
      roleId: user.user_role_id || "",
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    user.user_lastLogin = new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          user_name: user.user_name,
          user_email: user.user_email,
          user_phone: user.user_phone,
          user_organization_id: user.user_organization_id,
          user_role_id: user.user_role_id,
          user_lastLogin: user.user_lastLogin,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};
