const {Router} = require('express');
const { signup, login, updateUser, uploadProfilePicture, resolveForgotPassword } = require('../Controllers/Auths');
const { CREATOR, SINGNOR, UPDATOR, TAGUSER, DP_UPDATOR, FORGOT_PASSWORD } = require('../Middlewares/Authsware');
const router = Router();
// const {db} = require('./../Models/DB')

router.get('/signup', (req,res)=>{
  console.log(req);
  res.status(200).json(5000);
});

router.post('/signup', CREATOR, signup);
router.post('/login', SINGNOR, login);
router.post('/forgot-password', FORGOT_PASSWORD, resolveForgotPassword )
router.post('/update-user', UPDATOR, TAGUSER, updateUser);
router.post('/upload-profile-image', TAGUSER, uploadProfilePicture );


module.exports = router;