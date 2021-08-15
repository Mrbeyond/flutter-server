"use strict";
require('dotenv').config();
const {success, internal, notFound} = require('../Response/Res');
const JWT = process.env.jwt;

const Auths={

  signup: (req, res)=>{
    const {password} = req.body;


  },

  login: ()=>{

  },

  logout: ()=>{

  },

  getUser: ()=>{

  },



}

module.exports = Auths;

