const {Router} = require('express');
const { signup, login, updateUser, uploadProfilePicture, resolveForgotPassword, 
  confirmForgottenPasswordOTP, resetPassword, confirmUserEmailOTP, resendEmailConfirmationOTP
} = require('../Controllers/Auths');
const { CREATOR, SINGNOR, UPDATOR, TAGUSER, FORGOT_PASSWORD,
  CONFIRM_OTP, RESET_PASSWORD, EMAIL_OTP_RESEND,
} = require('../Middlewares/Authsware');
const router = Router();
// const {db} = require('./../Models/DB')

router.get('/signup', (req,res)=>{
  console.log(req);
  res.status(200).json(5000);
});

router.post('/signup', CREATOR, signup);
router.post('/login', SINGNOR, login);
router.post('/forgot-password', FORGOT_PASSWORD, resolveForgotPassword );
router.post('/update-user', UPDATOR, TAGUSER, updateUser);
router.post('/upload-profile-image', TAGUSER, uploadProfilePicture );
router.post('/confirm-password-otp', CONFIRM_OTP, confirmForgottenPasswordOTP);
router.post('/confirm-email-otp', CONFIRM_OTP, confirmUserEmailOTP);
router.post('/reset-password', RESET_PASSWORD, resetPassword);
router.post('/resend-email-confirmation-otp', EMAIL_OTP_RESEND, resendEmailConfirmationOTP);


module.exports = router;