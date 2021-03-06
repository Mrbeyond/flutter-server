/**
 * This file puts request payload to joi validation test
 * True or false is returned and made use in middlewares
 * 
 */


const { 
  createUser, updateUser, signIn, updateUserDP, forgotPassword, 
  confirmOtp, resetUserPassword, emailConfirmationOTP, 
} = require('./AuthLoads');

module.exports = {

  /** Validate createUser payload */
  creator: async(payload)=>{
    try {
      await createUser.validateAsync(payload);
      return true;
    } catch (e) {
      return false;
    }
  },

  /** Validate createUser payload */
  updator: async(payload)=>{
    try {
      await updateUser.validateAsync(payload);
      return true;
    } catch (e) {
      return false;
    }
  },

  /** Validate login payload */
  signor: async(payload)=>{
    try {
      await signIn.validateAsync(payload);
      return true;
    } catch (e) {
      return false;
    }
  },

  profileImageUpdator: async(payload)=>{
    try {
      await updateUserDP.validateAsync(payload);
      return true;
    } catch (e) {
      return false;
    }
  },

  passwordForgot: async(payload)=>{
    try {
      await forgotPassword.validateAsync(payload);
      return true;
    } catch (e) {
      return false;
    }
  },

  otpConfirmer: async(payload)=>{
    try {
      await confirmOtp.validateAsync(payload);
      return true;
    } catch (e) {
      return false;
    }
  },

  emailOTPResend: async(payload)=>{
    try {
      await emailConfirmationOTP.validateAsync(payload);
      return true;
    } catch (e) {
      return false;
    }
  },

  passwordResetter: async(payload)=>{
    try {
      await resetUserPassword.validateAsync(payload);
      return true;
    } catch (e) {
      return false;
    }
  }
}