const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const apptSchema = new Schema({
    visitor_name: {
        type: String,
        required: true
    },
    visitor_email: {
        type: String,
        required: true
    },
    visitor_photo: {
        type: String
    },
    hostId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    status:{
        type: String,
        enum: ["pending", "approved", "denied"],
        default: "pending"
    },
    check_in: {
        type: Date
    },
    check_out: {
        type: Date
    }
},{ timestamps: true })

module.exports = mongoose.model("Appointment",apptSchema);