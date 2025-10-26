import  express from 'express';
import { forgetPassword, loginUser, logOutUser, myProfile, registerWithOtp, resetPassword, userProfile, getAllUsers, makeAdmin } from '../controllers/userController.js';
import { isAuth } from '../middlewares/isAuth.js';
import { isAdmin } from '../middlewares/isAdmin.js';


const router=express.Router();

router.post("/register",registerWithOtp);
router.post("/login",loginUser);
router.post("/forget",forgetPassword);
router.post("/reset-password/:token",resetPassword);
router.get("/logout",isAuth,logOutUser);
router.get("/me",isAuth,myProfile);
router.get("/:id",isAuth,userProfile);
// Admin endpoints
router.get('/', isAuth, isAdmin, getAllUsers);
router.post('/make-admin', isAuth, isAdmin, makeAdmin);


export default router;