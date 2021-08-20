'use strict';
const {db, _type} = require('../DB');
const HASHIDS = require('hashids');
const hasher = new HASHIDS("userId", 6);

const Recovery = db.define('recovery', {
  OTP:{
    type: _type.STRING,
    unique: true,
    allowNull: false,
  },
  status:{
    type: _type.SMALLINT,
    defaultValue: 1,
  },
  tries: {    
    type: _type.SMALLINT,
    defaultValue: 0,
  },
  type:{    
    type: _type.SMALLINT,
    defaultValue: 1
  }
})

Recovery.prototype.toHard= function(){
  let val = Object.assign({}, this.get());
  val.userId = hasher.encode(val.userId);
  return val;
}

module.exports = {
  Recovery
}
