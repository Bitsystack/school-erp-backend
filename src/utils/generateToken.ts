import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  organizationId?: string;
  roleId?: string;
}

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });

  return {
    accessToken,
    refreshToken,
  };
};
