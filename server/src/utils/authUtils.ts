import jwt from "jsonwebtoken";

export const generateAccessToken = (payload: any): string => {
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "15m" });
};

export const generateRefreshToken = (): string => {
  return jwt.sign({}, process.env.REFRESH_SECRET_KEY, { expiresIn: "7d" });
};
