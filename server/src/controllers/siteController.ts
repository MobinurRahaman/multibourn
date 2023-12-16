import SiteModel from "../models/siteModel";
import generateOTP from "../utils/otpUtils";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";

interface ISiteController {
  initSite: (req: Request, res: Response, next: NextFunction) => void;
}

// Set OTP validity duration in minutes
const OTP_VALIDITY_MINUTES = 10;

const siteController: ISiteController = {
  // Function to initialize the site
  initSite: asyncHandler(async (req, res, next) => {
    const {
      siteName,
      siteDescription,
      email,
      password,
      currency,
      timezone,
      dateFormat,
      timeFormat,
      weekStartsOn,
    } = req.body;

    // Check if the site is already initialized
    const existingSite = await SiteModel.findOne();
    if (existingSite) {
      res.status(400);
      throw new Error("Cannot initialize the site more than once.");
    }

    // Generate OTP
    const otp = generateOTP();

    // Feed data
    const site = new SiteModel({
      siteName,
      siteDescription,
      email,
      password,
      currency,
      timezone,
      dateFormat,
      timeFormat,
      weekStartsOn,
      "emailVerification.otp": otp,
      "emailVerification.otpExpiresAt": new Date(
        Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000
      ),
    });

    // Save data to site collection
    site
      .save()
      .then(() => {
        res.status(201).json({
          status: "success",
          message: "Site initialized successfully",
        });
      })
      .catch((err: Error) => {
        // Check if the error is a validation error
        if (err.name === "ValidationError" && "errors" in err) {
          const validationErrors: { [key: string]: any } = {};

          // Loop through each validation error and extract the error messages
          for (const field in (err as any).errors) {
            if ((err as any).errors.hasOwnProperty(field)) {
              validationErrors[field] = (err as any).errors[field].message;
            }
          }

          // Pass the validation error messages to the error middleware with custom status code
          res.status(400);
          next({
            message: "validationErrors",
            errors: validationErrors,
            stack: err.stack,
          });
          return;
        }
        next(err);
      });
  }),
};

export default siteController;
