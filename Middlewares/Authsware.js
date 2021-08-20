'use strict';
const { intruder, internal, customError, resNotFound, unauthorized } = require('../Utilities/Res');
const { 
  creator, updator, signor, profileImageUpdator, 
  passwordForgot, otpConfirmer, passwordResetter, emailOTPResend,
} = require('./../Validators/AuthValidators/ValidateAuths');
const { verify } = require('jsonwebtoken');
const { User } = require('../Models/Assoc');
require('dotenv').config();

const HASHIDS = require('hashids');
const hasher = new HASHIDS("userId", 6);

const JWT = process.env.jwt;

module.exports={
  /** Middleware for creating new user */
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

  /**Middleware for updating user DP */
  DP_UPDATOR:async(req, res, next)=>{
    try {
      /** Test update DP payload */
      let check = await profileImageUpdator(req.body);    
      if(!check) return intruder(res);
      next();
    } catch (e) {
      return internal(res)
    }
  },

  /**Middleware for forgotten password */
  FORGOT_PASSWORD: async(req, res, next)=>{
    try {
      /** Test update forgotten password payload */
      let check = await passwordForgot(req.body);  
      if(!check) return intruder(res);
      next();
    } catch (e) {
      return internal(res)
    }
  },

  /**Middleware for OTP confirmation */
  CONFIRM_OTP: async(req, res, next)=>{
    try {
      /** Test update confirm OTP payload */
      let check = await otpConfirmer(req.body);
      if(!check) return intruder(res);
      next();
    } catch (e) {
      return internal(res)
    }
  },
  /** Middleware for resend OTP for confirmation email */
  EMAIL_OTP_RESEND: async(req, res, next)=>{
    try {
      /** Test resend OTP for email confirmation*/
      let check = await emailOTPResend(req.body);
      if(!check) return intruder(res);
      next();
    } catch (e) {
      return internal(res)
    }
  },

  /** Middleware for resetting user password */
  RESET_PASSWORD: async(req, res, next)=>{
    try {
      /** Test update confirm OTO payload */
      let check = await passwordResetter(req.body);       // console.log(check); 
      if(!check) return intruder(res);
      next();
    } catch (e) {
      return internal(res)
    }
  },


  /**Middleware for extraccting user identity from request header */
  TAGUSER: async(req, res, next)=>{
    try {
      /** parse auth header from request headers */
      let { authorization } = req.headers;
      if(!authorization) return unauthorized(res);
      let token = authorization.split(" ")[1]; // get the  token in [1]
      if(!token) return unauthorized(res);
      let UID;
      try {
        /** Verify the token */
        let _jwtData = await verify(token, JWT);
        UID = _jwtData.data; 
        // console.log("UID", UID);     
      } catch (e) {
        // console.log(e, '\n tag user up');
       return unauthorized(res);
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

