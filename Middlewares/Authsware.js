'use strict';
const { intruder, internal, customError, resNotFound } = require('../Response/Res');
const { creator, updator, signor, profileImageUpdator } = require('./../Validators/Validators');
const { verify } = require('jsonwebtoken');
const { User } = require('../Models/Assoc');
require('dotenv').config();

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
    
    } catch (e) {
      return internal(res)
    }
  },

  TAGUSER: async(req, res, next)=>{
    try {
      /** parse auth header from request headers */
      let { authorization } = req.headers;
      let token = authorization.split(" ")[1]; // get the  token in [1]
      let UID;
      try {
        /** Verify the token */
        let _jwtData = await verify(token, JWT);
        UID = _jwtData.data;      
      } catch (e) {
       return customError(res, "Please login");
      }

      // await User.sync()
      let user = User.findByPk(UID);
      if(!user) resNotFound(res, "User not found");
      req.UID = user.id;
      next();
    } catch (e) {
      return internal(res);
    }
  }



}

