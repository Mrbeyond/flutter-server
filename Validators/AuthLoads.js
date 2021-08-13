"use strict";
const {object, string} = require('joi');

module.exports={
  createUser: object({
    firstName: string().required(),
    lastName: string().required(),
    email: string().email().required(),
    password: string().regex(/^[a-zA-Z0-9]{8,}/).required()
  }),
  
}