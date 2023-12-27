import express, { Router } from "express";
import siteController from "../controllers/siteController";
import isSuperAdmin from "../middlewares/isSuperAdmin";

const router: Router = express.Router();

router.post("/init", siteController.initSite);
router.post("/request-otp", isSuperAdmin, siteController.requestOTP);
router.post("/verify-email", isSuperAdmin, siteController.verifyEmail);
router.post("/forgot-password", siteController.forgotPassword);
router.post("/reset-password", siteController.resetPassword);
router.post("/login", siteController.login);
router.get("/refresh-token", siteController.refreshToken);

export default router;
