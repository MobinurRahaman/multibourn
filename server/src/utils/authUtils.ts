import jwt from "jsonwebtoken";

export const generateAccessToken = (payload: any): string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

export const generateRefreshToken = (): string => {
  return jwt.sign({}, process.env.REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};
