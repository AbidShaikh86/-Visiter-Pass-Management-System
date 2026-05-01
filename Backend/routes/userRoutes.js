const express = require('express');
const { signUpUser, loginUser, getHosts } = require('../controller/user');

const Router = express.Router();

// route for user signup
Router.post('/sign-in',signUpUser)

// route for user login
Router.post('/log-in',loginUser)

// route for getting all the hosts
Router.get('/hosts', getHosts)

module.exports = Router