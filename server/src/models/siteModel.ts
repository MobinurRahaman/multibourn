import mongoose from "mongoose";
import validator from "validator";
import * as momentTimezone from "moment-timezone";
import * as cc from "currency-codes";
import bcrypt from "bcrypt";

const currencyCodes = cc.codes();

interface IEmailVerification {
  otp: string;
  otpExpiresAt: Date;
  lastResendAt: Date;
  resendAttempts: number;
}

interface ISite extends Document {
  siteName: string;
  siteDescription: string;
  email: string;
  password: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  weekStartsOn: string;
  emailVerification: IEmailVerification;
  resetPasswordToken: string;
  resetPasswordExpiresAt: Date;
}

const siteSchema = new mongoose.Schema<ISite>(
  {
    siteName: {
      type: String,
      required: [true, "Site name is required."],
      unique: true,
      minlength: [3, "Site name must be at least 3 characters long."],
      maxlength: [60, "Site name cannot exceed 60 characters."],
    },
    siteDescription: {
      type: String,
      maxlength: [300, "Site description cannot exceed 300 characters."],
      // The recommend description length is between 50 and 160 characters
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      validate: [validator.isEmail, "Invalid email format."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters long."],
      maxlength: [20, "Password cannot exceed 20 characters."],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
        "Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be 8 to 20 characters long.",
      ],
    },
    currency: {
      type: String,
      required: [true, "Currency is required."],
      enum: {
        values: currencyCodes,
        message: "Invalid currency code.",
      },
      default: "USD", // Set default value to "USD"
    },
    timezone: {
      type: String,
      required: [true, "Time zone is required."],
      default: "America/New_York", // Set default value to "America/New_York"
      validate: {
        validator(value: string) {
          return momentTimezone.tz.zone(value) !== null;
        },
        message: "Invalid time zone. Please provide a valid time zone.",
      },
    },
    dateFormat: {
      type: String,
      default: "MMMM DD, YYYY", // Set default value to the current date in the 'MMMM DD, YYYY' format
      validate: {
        validator(value: string) {
          const formats = [
            "YYYY-MM-DD", // Format 1 (e.g., 2023-06-20)
            "MM/DD/YYYY", // Format 2 (e.g., 06/20/2023)
            "DD-MM-YYYY", // Format 3 (e.g., 20-06-2023)
            "YYYY/MM/DD", // Format 4 (e.g., 2023/06/20)
            "DD/MM/YYYY", // Format 5 (e.g., 20/06/2023)
            "MM-DD-YYYY", // Format 6 (e.g., 06-20-2023)
            "DD MMMM, YYYY", // Format 7 (e.g., June 20, 2023)
            "DD MMMM YYYY", // Format 8 (e.g., June 20 2023)
            "MMMM DD, YYYY", // Format 9 (e.g., June 20, 2023)
            "MMMM DD YYYY", // Format 10 (e.g., June 20 2023)
            // Add more formats as needed
          ];

          return formats.includes(value);
        },
        message: "Invalid date format. Please provide a valid date.",
      },
    },
    timeFormat: {
      type: String,
      default: "h:mm A", // Set default value to current time in the 'h:mm A' format
      validate: {
        validator(value: string) {
          const formats = [
            "HH:mm", // Format 1 (e.g., 14:30)
            "h:mm A", // Format 2 (e.g., 2:30 PM)
            "h:mm a", // Format 3 (e.g., 2:30 pm)
            // Add more formats as needed
          ];

          return formats.includes(value);
        },
        message: "Invalid time format. Please provide a valid time.",
      },
    },
    weekStartsOn: {
      type: String,
      enum: {
        values: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        message: "Invalid week start day.",
      },
      default: "Monday",
    },
    emailVerification: {
      otp: String,
      otpExpiresAt: Date,
      lastResendAt: Date,
      resendAttempts: {
        type: Number,
        default: 0,
      },
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

siteSchema.pre("save", async function (next) {
  try {
    // Check if the password field exists and is modified (to avoid rehashing unchanged passwords)
    if (this.isModified("password") && this.password) {
      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Site = mongoose.model<ISite>("Site", siteSchema);

export default Site;
