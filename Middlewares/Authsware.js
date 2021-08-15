'use strict';
const { intruder, internal } = require('../Response/Res');
const { creator, updator } = require('./../Validators/Validators');

module.exports={
  CREATOR: async(req, res, next)=>{
    try {
      let check = await creator(req.body);
      if(!check) return intruder(res);
      next();
    } catch (e) {
      return internal(res);
    }
  },
  UPDATOR:  async(req, res, next)=>{
    try {
      let check = await updator(req.body);
      if(!check) return intruder(res);
      next();
    } catch (e) {
      return internal(res);
    }
  }
}

