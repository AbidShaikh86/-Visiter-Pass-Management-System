// getting all the required functions
const express = require('express');
const { bookAppointment, getStatus, checkLogs, getAppointments } = require('../controller/appt');
const apptModel = require('../model/apptModel');
const createPDF = require('../component/pdfGen')
const upload = require('../component/upload')
let authorize = require('../auth/auth')

// creating router
const Router = express.Router()

// routes for appointment booking
Router.post('/register', authorize(['visitor']), upload, bookAppointment)

// route for getting all the appointments
Router.get('/', authorize(['visitor', 'employee', 'admin', 'security']), getAppointments)

// route for changing the status of appointment
Router.patch('/status/:id', authorize(['employee','admin']),getStatus)

// route for checking the logs of appointment
Router.post('/check-logs', authorize(['security']), checkLogs)

// route for generating pdf 
Router.get('/pdf/:id', async (req, res) => {
    const { id } = req.params;

    const appt = await apptModel.findById(id)
    if(!appt){
        res.json({ message: "Visitor not Found!!" })
    }

    // calling the createPDF function
    await createPDF(appt, res)
})

module.exports = Router;