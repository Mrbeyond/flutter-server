'use strict';
const SENDGRID = require("@sendgrid/mail");
require("dotenv").config();
const APKEY = process.env.SENDGRID_API_KEY;

SENDGRID.setApiKey(APKEY);

module.exports= {
  SENDGRID
}