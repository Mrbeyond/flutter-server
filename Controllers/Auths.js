"use strict";
require('dotenv').config();
const {success, internal, resNotFound, customError, forbidden} = require('../Utilities/Res');
const JWT = process.env.jwt;
const { hash, compare } = require('bcrypt');
const { User, Recovery } = require('./../Models/Assoc');
const { sign } = require('jsonwebtoken');
const { CLOUD_MULTER } = require('../Utilities/FileProcess');
const { cloud } = require('../Utilities/Cloudinary');
const { createReadStream } = require('streamifier');
const { otp } = require('../Utilities/Random');
const { _op, _literal } = require('../Models/DB');
const { confirmEmail, recoveryOTP } = require('../Utilities/MailSamples');
const { SENDGRID } = require('../Utilities/Sendgrid');
const timediff = require("timediff");


const Auths={
  
  /** Method that creates new user */
  signup: async(req, res)=>{
    try {
      let {password, email} = req.body;
      // check if user already exists
      let check = await User.findOne({where:{email}});
      // console.log(check, '\n', 'is check');
      if(check) return forbidden(res, "User already exists");
      /** Encrypted password before saving */
      const _encrypt = await hash(password, 10);
      req.body.password = _encrypt;
      // await User.sync({force: true});
      // await User.sync();
      let user = await User.create( req.body);
      let { id } = user;
      // generate jwt token from user id
      const token = await sign({data: id}, JWT);

      // send Confirmation Email to the New user's email.
      let _otp;
      // generate a unique OTP
      while (true) {
        let OTP = otp();
        let count = await Recovery.count({where:{OTP}})
        if(count < 1){
          _otp = OTP;
          break;
        }      
      }

      let {accName} = user.toHard();
      
      /** Email sample data */
      let emailData = confirmEmail(email, accName, _otp);
      /** Email logic here */
      SENDGRID.send(emailData)
      .then(async()=>{
        // if email is sent then  
        try {
          let data = {
            userId: user.id,
            OTP: _otp,
            status: 1,
            retries: 0,
            type: 1,
          }
          await Recovery.create(data);
           /**
           * Note the user.toHard()  used below.
           * It is a prototyped method created in the model so as to hide password 
           * and encrypt user id.
           */ 
          return success(res, {data:user.toHard(), token});
        } catch (e) {

          console.log(e);
          return internal(res);
        }
      })
      .catch(async(err)=>{
        console.log(err);
        await user.destroy();
        return internal(res);
      }) 
      // Email ends here    
    } catch (e) {
      console.log(e);
     return internal(res);
    }
  },

  /** Method that logs in existing user */
  login:async(req, res)=>{
    try {
      let {email, password} = req.body;
      // await User.sync();
      let user = await User.findOne({where:{email}});
      if(!user) return resNotFound(res, "Incorrect Email or Password");
      let isPasswordMatch = await compare(password, user.password);
      if(!isPasswordMatch) return resNotFound(res, "Incorrect Email or Password");      
      // generate jwt token from user id
      let token = await sign({data: user.id}, JWT);
      /**
       * Note the user.toHard()  used below.
       * It is a prototyped method created in the model so as to hide password 
       * and encrypt user id.
       */ 
      return success(res, {data: user.toHard(), token});
    } catch (e) {
      console.log(e);
      return internal(res);
    }
  },


  logout: (req, res)=>{

  },

  /** Method that updates existing user */
  updateUser: async(req, res)=>{
    try {
      let {UID} = req;
      let [row] = await User.update(req.body,
        {
          where:{ id: UID}
        }
      );
      if(row) console.log(row);
      let user = await User.findByPk(UID);
      if(!user) return resNotFound(res, "User exists but can't fetch");
      /**
       * Note the user.toHard()  used below.
       * It is a prototyped method created in the model so as to hide password 
       * and encrypt user id.
       */ 
      return success(res, {data: user.toHard()});   
    } catch (e) {
      console.log(e);
      return internal(res);
    }    
  },

  /** Method that handles uploadng profile picture */
  uploadProfilePicture: async(req, res)=>{
    try {
      CLOUD_MULTER.single("profileImage")(req,res, async(err)=>{
        console.log("\n Inside multer \n");
        if(err){
          console.log("Error inside multer", err);
          return forbidden(res, "File rejected");
        }
        let {file} = req;
        // console.log(file);
        if(!file) return forbidden(res, "Image must be uploaded");
        let cloudinaryUpStream = await cloud.v2.uploader.upload_stream(
          {
            folder: "FlutterChatApp/profileImage",
            public_id: req.UID+'_pp_'+Date.now()
          },
          async(error, result)=>{
            if(!error){
              // join secure_url and public_id for easy access using @@@
              let address = result.secure_url+"@@@"+result.public_id;
              let user = await User.findByPk(req.UID);
              if(user.profilePic){
                //separate the public_id from existing picture address;
                let currentAdress = user.profilePic.split("@@@");
                if(currentAdress[1]){
                  //then delete existing profilePic
                  await cloud.v2.uploader.destroy(currentAdress[1], (ERR, RESULT)=>{
                    if(ERR) console.log(ERR);
                    console.log(RESULT);
                  })
                }
              }
              user.profilePic = address;
              await user.save();
              /**
               * Note the user.toHard()  used below.
               * It is a prototyped method created in the model so as to hide
               *  password and encrypt user id.
               */ 
              return success(res, {data:user.toHard()});
            }else{
              // return customError(res, error);
              return internal(res);
            }
          }
        );
        try {
          await createReadStream(file.buffer).pipe(cloudinaryUpStream);
        } catch (e) {
          return internal(res);
        }
      })
    } catch (e) {
      console.log(e);
      // return customError(res, e);
      return internal(res);
    }
  },


  /** Method that resent OTP to user email form email confirmation
   */
  resendEmailConfirmationOTP: async(req, res)=>{
    try {
      let {email} = req.body;
      let user = await User.findOne({where:{email}});
      if(!user) return resNotFound(res, "User not found");
      /** If email is alredy verified, then return email, equal as verification confirmed */
      if(user.verified == 1) return success(res, {data: {email}});
      let _otp;
      // generate a unique OTP
      while (true) {
        let OTP = otp();
        let count = await Recovery.count({where:{OTP}})
        if(count < 1){
          _otp = OTP;
          break;
        }      
      }
      // console.log(_otp);
      let data = {
        userId: user.id,
        OTP: _otp,
        status: 1,
        retries: 0,
        type: 1,
      }

      let {accName} = user.toHard();
      
      /** Email logic here */
      let emailData = confirmEmail(email, accName, _otp);
      SENDGRID.send(emailData)
      .then(async()=>{
        // if email is sent then  
        // Recovery update Or Create
        try {
          let recovery = await Recovery.findOne({where:{userId: user.id}});
          if(recovery){
            await Recovery.update(data, {where:{userId: user.id}});
          }else{
            await Recovery.create(data);
          }
  
          return success(res, {data: "OTP sent to the provided email"});
        } catch (e) {
          console.log(e);
          return internal(res);
        }
      })
      .catch(err=>{
        console.log(err);
        return internal(res);
      }) 
      // email logic ends here
    } catch (e) {
    
    }
  },

  /** Method that initiates forgotten password process
   * by requesting fpr the account email and generate OTP
   * if account exists and got OPT sent to the account's email
   */
  resolveForgotPassword: async(req, res)=>{
    try {
      let {email} = req.body;
      let user = await User.findOne({ where:{email} });
      if(!user) return resNotFound(res, "User not found");
      let _otp;
      // generate a unique OTP
      while (true) {
        let OTP = otp();
        let count = await Recovery.count({where:{OTP}})
        if(count < 1){
          _otp = OTP;
          break;
        }      
      }
      // console.log(_otp);
      let data = {
        userId: user.id,
        OTP: _otp,
        status: 1,
        retries: 0,
        type: 2
      }

      let {accName} = user.toHard();
      
      /** Email logic here */
      let emailData = recoveryOTP(email, accName, _otp);
      SENDGRID.send(emailData)
      .then(async()=>{
        // if email is sent then  
        // Recovery update Or Create
        try {
          let recovery = await Recovery.findOne({where:{userId: user.id}});
          if(recovery){
            console.log("\n \n exists \n \n");
            await Recovery.update(data, {where:{userId: user.id}});
          }else{
            console.log("\n \n new \n \n");
            await Recovery.create(data);
          }
  
          return success(res, {data: "OTP sent to the provided email"});
        } catch (e) {
          console.log(e);
          return internal(res);
        }
      })
      .catch(err=>{
        console.log(err);
        return internal(res);
      })
      // email logic ends here
    } catch (e) {      
      console.log(e);
      return internal(res);
    }
  },

  /** Method that handles user email verification OTP */
  confirmUserEmailOTP: async(req, res)=>{
    try {
      let { OTP, email } = req.body;
      let recovery = await Recovery.findOne({
        where:{
          OTP,
          type: 1,
          userId:{
            [_op.eq]: _literal(`(SELECT id FROM users WHERE email = '${email}')`)
          }
        }
      });
      if(!recovery) return resNotFound(res, "Invalid OTP");
      console.log(new Date(recovery.updatedAt));
      let user = await User.findByPk(recovery.userId);
      user.verified = 1;
      await user.save();
      await recovery.destroy();
      // return email to come back with password
      return success(res, {data: {email}});
    } catch (e) {
      console.log(e);
      return internal(res);
    }
  },

  /** Method that confirms the provided OTP by user during
   * forgotten passord 
   */
  confirmForgottenPasswordOTP: async(req, res)=>{
    try {
      let { OTP, email } = req.body;
      let recovery = await Recovery.findOne({
        where:{
          OTP,
          type: 2,
          userId:{
            [_op.eq]: _literal(`(SELECT id FROM users WHERE email = '${email}')`)
          }
        }
      });
      if(!recovery) return resNotFound(res, "Invalid OTP");
      // Is OTP expiered
      if(!recovery.status) return forbidden(res, "Expired OTP");
      // Check if the OTP has expired
      let diff = await timediff( new Date(recovery.updatedAt), new Date(), 'm');
      console.log(diff, 'otp time'); //tbd
      if(diff.minutes > 10){
        recovery.status = 0;
        await recovery.save()
        if(!recovery) return forbidden(res, "Expired OTP");
      }
      // Delete recovery 
      await recovery.destroy();
      // return email to come back with password
      return success(res, {data: {email}});
    } catch (e) {
      console.log(e);
      return internal(res);
    }
  },
  

  /** Method that handles resetting new password */
  resetPassword: async(req, res)=>{
    try {
      let {password, email} = req.body;  
      // find user with email
      let user = await User.findOne({where:{email}});
      if(!user) return resNotFound(res, "User not found");

      // Check if the user is aware by confirming forgotten PS OTP 
      let count = await Recovery.count({where:{userId: user.id, status: 2}});
      if(count) return forbidden(res, "Password reset OTP must be provided firts");
      /** Encrypted password*/ 
      const _encrypt = await hash(password, 10);
      user.password = _encrypt;
      await user.save();
      return success(res, {data: "Password successfuly changed"});    
    } catch (e) {      
      console.log(e);
      return internal(res);
    }
  },

  // getUser: ()=>{

  // },



}

module.exports = Auths;