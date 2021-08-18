"use strict";
require('dotenv').config();
const {success, internal, notFound, resNotFound, customError} = require('../Utilities/Res');
const JWT = process.env.jwt;
const { hash, compare } = require('bcrypt');
const { User, Recovery } = require('./../Models/Assoc');
const { sign } = require('jsonwebtoken');
const { CLOUD_MULTER } = require('../Utilities/FileProcess');
const { cloud } = require('../Utilities/Cloudinary');
const { createReadStream } = require('streamifier');
const { otp } = require('../Utilities/Random');
const { _op, _literal } = require('../Models/DB');


const Auths={
  
  /** Method that creates new user */
  signup: async(req, res)=>{
    try {
      let {password, email} = req.body;
      // check if user already exists
      let check = await User.findOne({where:{email}});
      // console.log(check, '\n', 'is check');
      if(check) return customError(res, "User already exists");
      /** Encrypted password before saving */
      const _encrypt = await hash(password, 10);
      req.body.password = _encrypt;
      // await User.sync({force: true});
      // await User.sync();
      let user = await User.create( req.body);
      let { id } = user;
      // generate jwt token from user id
      const token = await sign({data: id}, JWT);
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
      return customError(res, e);
    }    
  },

  /** Method that handles uploadng profile picture */
  uploadProfilePicture: async(req, res)=>{
    try {
      CLOUD_MULTER.single("profileImage")(req,res, async(err)=>{
        console.log("\n Inside multer \n");
        if(err){
          console.log("Error inside multer", err);
          return customError(res, "File rejected");
        }
        let {file} = req;
        // console.log(file);
        if(!file) return customError(res, "Image must be uploaded");
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
              return customError(res, error);
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
      return customError(res, e);
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
      }
      
      /** Email logic here */
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
    } catch (e) {      
      console.log(e);
      return internal(res);
    }
  },

  /** Method that confirms the provided OTP by user during
   * forgotten passord 
   */
  confirmOTP: async(req, res)=>{
    try {
      let { OTP, email } = req.body;
      let recovery = await Recovery.findOne({
        where:{
          OTP,
          userId:{
            [_op.eq]: _literal(`(SELECT id FROM users WHERE email = '${email}')`)
          }
        }
      });
      if(!recovery) return resNotFound(res, "Invalid OTP");
      console.log(new Date(recovery.updatedAt));
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

