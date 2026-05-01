const express = require('express');
const { bookAppointment, getStatus, checkLogs } = require('../controller/appt');
const apptModel = require('../model/apptModel');
const createPDF = require('../component/pdfGen')
let authorize = require('../auth/auth')

const Router = express.Router()
authorize = (roles) => (req, res, next) => next();

Router.post('/register',bookAppointment)

Router.patch('/status/:id', authorize(['employee','admin']),getStatus)

Router.post('/check-logs', authorize(['security']), checkLogs)

Router.get('/pdf/:id', async (req, res) => {
    const { id } = req.params;

    const appt = await apptModel.findById(id)
    if(!appt){
        res.json({ message: "Visitor not Found!!" })
    }

    await createPDF(appt, res)
})

module.exports = Router;