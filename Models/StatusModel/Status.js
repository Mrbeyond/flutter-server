'use strict';

const { db, _type } = require("../DB");

const Status = db.define("status", {
  id: {
    type: _type.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  type:{
    type: _type.SMALLINT,
    allowNull: false,
  },
  content: {
    type: _type.TEXT,
    allowNull: false,
  },
  background: {
    type: _type.STRING
  },
  
})

module.exports={
  Status
}