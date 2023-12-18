import nodemailer, { Transporter } from "nodemailer";

// Declare interface for emailService
interface IEmailService {
  sendEmail: (
    to: string,
    subject: string,
    htmlContent: string
  ) => Promise<{ message: string }>;
}

const emailService: IEmailService = {
  sendEmail: async (to, subject, htmlContent) => {
    try {
      // Create a transporter object using your email provider's SMTP settings
      // You can change config from .env file
      const transporter: Transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: true,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Configure the email options
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html: htmlContent,
      };

      // Send the email
      const info = await transporter.sendMail(mailOptions);
      // If the email is sent successfully, return a success status
      return { message: "Email sent successfully" };
    } catch (error) {
      console.error("Error occurred to send mail:", error.message);
      // If an error occurs during email sending, throw the error
      throw new Error("Failed to send Email");
    }
  },
};

export default emailService;
