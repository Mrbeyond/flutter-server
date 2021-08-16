"use strict";
// const {object, string} = require('joi');
const joi = require('joi');

module.exports={
  /** The payload objects for create user */
  createUser: joi.object({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().regex(/^[a-zA-Z0-9_]{6,}/).required()
  }),

  /** The payload objects for update user */
  updateUser: joi.object({    
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    email: joi.string().email().required(),
    gender: joi.string().required(),
    status: joi.string().required(),
    verified: joi.string().required(),
    userName: joi.string().required()
  }),

  /** The payload objects for login user */
  signIn: joi.object({    
    email: joi.string().email().required(),
    password: joi.string().regex(/^[a-zA-Z0-9_]{6,}/).required()
  }),

  updateUserDP: joi.object({
    profileImage: joi.any().required(),
  })
  
  
}