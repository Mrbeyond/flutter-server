"use strict";
require('dotenv').config();
const {success, internal, notFound, resNotFound, customError} = require('../Response/Res');
const JWT = process.env.jwt;
const { hash, compare } = require('bcrypt');
const { User, Recovery } = require('./../Models/Assoc');
const { sign } = require('jsonwebtoken');
const { CLOUD_MULTER } = require('../Utilities/FileProcess');
const { cloud } = require('../Utilities/Cloudinary');
const { createReadStream } = require('streamifier');
const { otp } = require('../Utilities/Random');


const Auths={
  
  /** Method that creates new user */
  signup: async(req, res)=>{
    try {
      let {password, email} = req.body;
      let check = await User.findOne({where:{email}});
      console.log(check, '\n', 'is checck');
      if(check) return customError(res, "User already exists");
      const _encrypt = await hash(password, 10);
      req.body.password = _encrypt;
      // await User.sync({force: true});
      // await User.sync();
      let user = await User.create( req.body);
      let { id } = user;
      const token = await sign({data: id}, JWT);
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
      let token = await sign({data: user.id}, JWT);
      return success(res, {data: user.toHard(), token});
    } catch (e) {
      console.log(e);
      return internal(res);
    }
  },


  logout: (req, res)=>{

  },


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
      return success(res, {data: user.toHard()});   
    } catch (e) {
      console.log(e);
      return customError(res, e);
    }    
  },

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
              return success(res, {data:user});
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

  resolveForgotPassword: async(req, res)=>{
    try {
      let {email} = req.body;
      let user = await User.findOne({ where:{email} });
      if(!user) return resNotFound(res, "User not found");
      let _otp;
      while (true) {
        let OTP = otp();
        let count = await Recovery.count({where:{OTP}})
        if(count < 1){
          _otp = OTP;
          break;
        }      
      }
      console.log(_otp);
      let data = {
        userId: user.id,
        OTP: _otp,
        status: 1,
        retries: 0,
      }
      
      /** Email logic here */
      // if email is sent then
      // Recovery.updateOrCreate
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

  getUser: ()=>{

  },



}

module.exports = Auths;

