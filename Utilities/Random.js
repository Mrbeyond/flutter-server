"use strict";

const otp = ()=>{
  let val = "";
  for (let index = 0; index < 6; index++) {
    val += Math.floor(Math.random() * 10);    
  }
  return val;
}


module.exports = {
  otp
}