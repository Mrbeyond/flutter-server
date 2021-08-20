"use strict";

/**
 * This file is created to have clean association of models in an isolation 
*/

const {User} = require('./AuthModels/User');
const {Recovery} = require('./AuthModels/Recovery');

Recovery.belongsTo(User, {
  foreignKey: {
    allowNull: false,
    unique: true,
  }
});




module.exports={
  User, Recovery
}