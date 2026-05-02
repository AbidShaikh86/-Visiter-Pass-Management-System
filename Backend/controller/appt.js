// Schema for Booking Appointments
const apptModel = require('../model/apptModel')
const userModel = require('../model/userModel')
const sendEmail = require('../component/email')

// Controller for handling appointment Booking 
exports.bookAppointment = async (req, res) => {
    // Extracting visitor name, email, and host ID from the request body
    const { name, email, hostId } = req.body;
    const photo = req.file ? req.file.path : null;

    try {
        // Creating a new appointment document in the database 
        const newAppt = await apptModel.create({ 
            visitor_name: name, 
            visitor_email: email, 
            visitor_photo: photo,
            hostId: hostId 
        });

        // Send email to host
        const host = await userModel.findById(hostId);
        if (host) {
            sendEmail(host.email, 'New Appointment Request', `You have a new appointment request from ${name} (${email}).`);
        }

        // Sending response with the newly created appointment 
        res.status(201).json(newAppt);
        
    } catch (error) {
        // Handling any errors
        res.status(500).json({ message: error.message });
    }
}

// Controller for updating appointment status (e.g., approved, rejected) 
// derfault status is pending
exports.getStatus = async (req, res) => {
    // Extracting appointment ID
    const { id } = req.params
    // Extracting new status from the request body
    const { status } = req.body

    // Updating the appointment status
    const data = await apptModel.findByIdAndUpdate(id, {status: status}, {new: true})

    // Send email to visitor
    if (data) {
        sendEmail(data.visitor_email, 'Appointment Status Update', `Your appointment has been ${status}.`);
    }

    // Sending response with the updated appointment data
    res.json(data)
}

// Controller for recording check-in and check-out
exports.checkLogs = async (req, res) => {
    // Extracting appointment ID and type
    const { apptId, type } = req.body;
    // checking if the type is valid
    const update = type === 'entry' ? { check_in: new Date() } : { check_out: new Date() };
    // Updating the appointment with check-in or check-out
    await apptModel.findByIdAndUpdate(apptId, update);
    // Sending response confirming time recorded
    res.json({ message: `Visitor ${type} recorded` });
}

// Controller for retrieving appointments based on user role
exports.getAppointments = async (req, res) => {
    // Extracting user role, ID, and email
    const { role, id, email } = req.query;
    // Building query based on user role
    let query = {};
    // if conditions to display appointments based on the role
    if (role === 'visitor') {
        query = { visitor_email: email };
    } else if (role === 'employee') {
        query = { hostId: id };
    } else if (role === 'admin' || role === 'security') {
        query = {};
    }
    
    // Fetching appointments from the database based on query
    try {
        // Populating host details for employee
        const appts = await apptModel.find(query).populate('hostId', 'name');
        // Sending response
        res.json(appts);
    } catch (error) {
        // Handling any errors
        res.status(500).json({ message: error.message });
    }
}