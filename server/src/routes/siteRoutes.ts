import express, { Router } from "express";
import siteController from "../controllers/siteController";

const router: Router = express.Router();

router.post("/init", siteController.initSite);
router.post("/request-otp", siteController.requestOTP);
router.post("/verify-email", siteController.verifyEmail);

export default router;
