import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/authUtils";

interface TokenPayload {
  siteId: string;
  iat: number;
  exp: number;
}

interface CustomRequest extends Request {
  auth: TokenPayload;
}

const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Extract the access token from the request cookies
  const accessToken = req.cookies.super_admin_access_token;

  // Check if the access token is provided
  if (!accessToken) {
    res.status(401);
    throw new Error("Super admin access token is not provided.");
  }

  try {
    // Verify access token
    const decoded = verifyToken(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET_KEY
    );

    // Attach the decoded authentication payload to the request object
    (req as CustomRequest).auth = decoded as TokenPayload;
    next();
  } catch (error) {
    res.status(401);
    next(error);
  }
};

export default isSuperAdmin;
