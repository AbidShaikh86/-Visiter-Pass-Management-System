const apptModel = require('../model/apptModel')

exports.bookAppointment = async (req, res) => {
    const { name, email, hostId } = req.body;

    try {
        const newAppt = await apptModel.create({ 
            visitor_name: name, 
            visitor_email: email, 
            hostId: hostId 
        });
        res.status(201).json(newAppt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getStatus = async (req, res) => {
    const { id } = req.params
    const { status } = req.body

    const data = await apptModel.findByIdAndUpdate(id, {status: status}, {new: true})

    res.json(data)
}

exports.checkLogs = async (req, res) => {
    const { apptId, type } = req.body;
    const update = type === 'entry' ? { check_in: new Date() } : { check_out: new Date() };
    await apptModel.findByIdAndUpdate(apptId, update);
    res.json({ message: `Visitor ${type} recorded` });
}