'use strict';
const {db, _type} = require('./DB');


const User = db.define("User", {
  id:{
    type: _type.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  firstName:{
    allowNull: false,
    type: _type.STRING
  },
  lastName:{
    allowNull: false,
    type: _type.STRING
  },
  email:{
    type: _type.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
    // type: _type
  },
  userName:{
    type: _type.STRING,
    unique: true,
    validate:{
      min: 3
    }
  },  
  status:{
    type: _type.SMALLINT,
    defaultValue: 1,
    allowNull: false,
  },
  password:{
    type: _type.STRING,
    allowNull: false,
    validate:{
    
    }
  },
  verified: {
    type: _type.SMALLINT,
    defaultValue: 0,
    allowNull: false,
  },
  gender:{
    type: _type.STRING,
    allowNull: true,
    validate:{
      isIn: [['Male','Female','Other']]
    }
  },
  profilePic:{
    type: _type.TEXT,
    allowNull: true
  },

})

const SYNC = async()=>{
  await db.sync({force: false});
}
SYNC();

module.exports={
  User,
}