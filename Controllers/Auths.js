"use strict";
require('dotenv').config();
const {success, internal, notFound, resNotFound, customError} = require('../Response/Res');
const JWT = process.env.jwt;
const { hash, compare } = require('bcrypt');
const { User } = require('./../Models/Assoc');
const { sign } = require('jsonwebtoken');
const { CLOUD_MULTER } = require('../Utilities/FileProcess');
const { cloud } = require('../Utilities/Cloudinary');
const { createReadStream } = require('streamifier');


const Auths={
  
  /** Method that creates new user */
  signup: async(req, res)=>{
    try {
      let {password, email} = req.body;
      let check = User.findOne({where:{email}});
      if(check) return customError(res, "User already exists");
      const _encrypt = await hash(password, 10);
      req.body.password = _encrypt;
      // await User.sync({force: true});
      // await User.sync();
      let user = await User.create( req.body);
      let { id } = user;
      const token = await sign({data: id}, JWT);
      return success(res, {data:user, token});
    
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
      return success(res, {data: user, token});
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
      let gg = await User.update(req.body,
        {
          where:{ id: UID}
        }
      );
      
      return success(res, gg);    
    } catch (e) {
      console.log(e);
      return customError(res, e);
    }    
  },

  uploadProfilePicture: async(req, res)=>{
    try {
      CLOUD_MULTER.single("profileImage")(req,res, (err)=>{
        if(err){
          console.log("Error inside multer");
          return internal(res);
        }
        // let {file} = req;
        let cloudinaryUpStream = cloud.v2.uploader.upload_stream(
          {folder: "profileImage"},
          (error, result)=>{
            if(!error){
              return success(res, result);
            }else{
              return customError(res, error);
            }
          }
        );
        await createReadStream(file.buffer).pipe(cloudinaryUpStream);
      })
    } catch (e) {
      console.log(e);
      return customError(res, e);
    }


  },

  getUser: ()=>{

  },



}

module.exports = Auths;

