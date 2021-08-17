'use strict';
const { intruder, internal, customError, resNotFound } = require('../Response/Res');
const { creator, updator, signor, profileImageUpdator, passwordForgot } = require('./../Validators/AuthValidators/ValidateAuths');
const { verify } = require('jsonwebtoken');
const { User } = require('../Models/Assoc');
require('dotenv').config();

const HASHIDS = require('hashids');
const hasher = new HASHIDS("userId", 6);

const JWT = process.env.jwt;

module.exports={
  /** Middleware for create new user */
  CREATOR: async(req, res, next)=>{
    try {
      /** Test create user payload */
      let check = await creator(req.body);
      if(!check) return intruder(res);
      next();
    } catch (e) {
      return internal(res);
    }
  },

  /** Middleware for update exiting user details */
  UPDATOR: async(req, res, next)=>{
    try {
      /** Test update user payload */
      let check = await updator(req.body);
      if(!check) return intruder(res);
      next();
    } catch (e) {
      return internal(res);
    }
  },


  /** Middleware for user that wants to log in */
  SINGNOR: async(req, res, next)=>{
    try {
      /** Test login payload */
      let check = await signor(req.body);
      if(!check) return intruder(res);
      next();
    } catch (e) {
      return internal(res);
    }
  },
  DP_UPDATOR:async(req, res, next)=>{
    try {
      let check = await profileImageUpdator(req.body);    
      if(!check) return intruder(res);
      next();
    } catch (e) {
      return internal(res)
    }
  },

  FORGOT_PASSWORD: async(req, res, next)=>{
    try {
      let check = await passwordForgot(req.body);  
      if(!check) return intruder(res);
      next();
    } catch (e) {
      return internal(res)
    }
  },

  TAGUSER: async(req, res, next)=>{
    try {
      /** parse auth header from request headers */
      let { authorization } = req.headers;
      if(!authorization) return customError(res, "Please login");
      let token = authorization.split(" ")[1]; // get the  token in [1]
      if(!token) return customError(res, "Please login");
      let UID;
      try {
        /** Verify the token */
        let _jwtData = await verify(token, JWT);
        UID = _jwtData.data; 
        // console.log("UID", UID);     
      } catch (e) {
        // console.log(e, '\n tag user up');
       return customError(res, "Please login");
      }

      // await User.sync()
      let user = await User.findByPk(UID);
      if(!user) return resNotFound(res, "User not found");
      req.UID = user.id;
      // console.log("passed");
      next();
    } catch (e) {
      console.log(e, '\n tag user down');
      return internal(res);
    }
  }



}

