const express = require('express');
const { signUpUser, loginUser } = require('../controller/user');

const Router = express.Router();

Router.post('/sign-in',signUpUser)

Router.post('/log-in',loginUser)

module.exports = Router