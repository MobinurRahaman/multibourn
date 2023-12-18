import SiteModel from "../models/siteModel";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import ms from "ms";
import ejs from "ejs";
import path from "path";
import generateOTP from "../utils/otpUtils";
import emailService from "../services/emailService";

interface ISiteController {
  initSite: (req: Request, res: Response, next: NextFunction) => void;
  requestOTP: (req: Request, res: Response, next: NextFunction) => void;
  verifyEmail: (req: Request, res: Response, next: NextFunction) => void;
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
    const existingSite = await SiteModel.findOne({});
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
  // Function to request OTP for email verification
  requestOTP: asyncHandler(async (req, res, next) => {
    try {
      const { email } = req.body;

      // Check if the site is already initialized
      const site = await SiteModel.findOne({ email }).select("-password");

      if (!site) {
        res.status(404);
        throw new Error(
          "This email address does not correspond to the super admin account for this site. Kindly verify that you have entered the correct email address."
        );
      }

      // Check if email is already verified
      if (!site.emailVerification.otp) {
        res.status(400);
        throw new Error("Super admin email is already verified.");
      }

      // Calculate the resend interval with exponential backoff
      const currentTime = new Date().getTime();
      const lastResendAtTime =
        site.emailVerification.lastResendAt?.getTime() || 0;
      const resendInterval =
        Math.min(2 ** (site.emailVerification.resendAttempts || 0) * 2, 30) *
        60 *
        1000; // Example: If resendAttempts is 2, the calculation is 2^2 * 2 = 8, capped at a maximum resendInterval of 30 minutes.

      // Check if OTP can be resent
      if (lastResendAtTime && currentTime - lastResendAtTime < resendInterval) {
        const remainingTime = ms(
          resendInterval - (currentTime - lastResendAtTime)
        ); // Convert to hours/minutes/seconds
        res.status(400);
        throw new Error(`You can request OTP in ${remainingTime}.`);
      }

      // Generate and save new OTP
      const newOTP = generateOTP();
      site.emailVerification.otp = newOTP;
      site.emailVerification.otpExpiresAt = new Date(
        currentTime + OTP_VALIDITY_MINUTES * 60 * 1000
      );

      if (site.emailVerification.lastResendAt) {
        site.emailVerification.resendAttempts =
          (site.emailVerification.resendAttempts || 0) + 1;
      }

      site.emailVerification.lastResendAt = new Date(currentTime);
      await site.save();

      // Render the EJS template with dynamic content
      const emailContent = await ejs.renderFile(
        path.join(__dirname, "../views/otp-email.ejs"),
        {
          otp: newOTP,
          otpValidity: OTP_VALIDITY_MINUTES,
          target: "superadmin",
        }
      );

      // Send OTP via email
      await emailService.sendEmail(
        email,
        "Multibourn OTP Verification to Become the Super Admin",
        emailContent
      );

      res.status(200).json({
        status: "success",
        message: "An OTP has been successfully sent to your email inbox.",
      });
    } catch (error) {
      next(error); // Use next to pass the error to the error middleware
    }
  }),
  // Function to verify email using OTP
  verifyEmail: asyncHandler(async (req, res, next) => {
    try {
      const { email, otp } = req.body;

      // Find the site by email
      const site = await SiteModel.findOne({ email }).select("-password");

      if (!site) {
        res.status(404);
        throw new Error(
          "This email address does not correspond to the super admin account for this site. Kindly verify that you have entered the correct email address."
        );
      }

      // Check if email is already verified
      if (!site.emailVerification.otp) {
        res.status(400);
        throw new Error("Super admin email is already verified.");
      }

      // Check if OTP is valid and not expired
      if (
        site.emailVerification.otp !== otp ||
        new Date() > site.emailVerification.otpExpiresAt
      ) {
        res.status(400);
        throw new Error("Invalid OTP or OTP expired.");
      }

      // Update site's email verification status
      site.emailVerification.otp = null;
      site.emailVerification.otpExpiresAt = null;
      site.emailVerification.lastResendAt = null;
      site.emailVerification.resendAttempts = 0;
      await site.save();

      res
        .status(200)
        .json({ status: "success", message: "Email verified successfully." });
    } catch (error) {
      next(error);
    }
  }),
};

export default siteController;
