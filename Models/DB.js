"use strict";
const  { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const DB = process.env.DB;
const host = process.env.host;
const user = process.env.user;
const password = process.env.password;
const dialect = process.env.dialect;
console.log(DB, host, user, password,dialect);
const sequelize = new Sequelize(
  DB,
  user,
  password,
  {
    host: host,
    dialect: dialect,
  }
)

const chcek = async()=>{
  try {
 await sequelize.authenticate();
 console.log("Database Connected");
} catch (e) {
 console.log(`Data base error is \n ${e} \n `);
}
}
chcek();

module.exports = {db: sequelize, _type:DataTypes};