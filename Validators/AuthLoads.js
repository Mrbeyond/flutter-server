"use strict";
const {object, string} = require('joi');

module.exports={
  /** The payload objects for create user */
  createUser: object({
    firstName: string().required(),
    lastName: string().required(),
    email: string().email().required(),
    password: string().regex(/^[a-zA-Z0-9_]{6,}/).required()
  }),

  /** The payload objects for update user */
  updateUser: object({    
    firstName: string().required(),
    lastName: string().required(),
    email: string().email().required(),
    gender: string().required(),
    status: string().required(),
    verified: string().required(),
    userName: string().required()
  }),

  /** The payload objects for login user */
  signIn: object({    
    email: string().email().required(),
    password: string().regex(/^[a-zA-Z0-9_]{6,}/).required()
  }),
  
  
}