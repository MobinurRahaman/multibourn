import express, { Router } from "express";
import siteController from "../controllers/siteController";

const router: Router = express.Router();

router.post("/init", siteController.initSite);
router.post("/request-otp", siteController.requestOTP);

export default router;
