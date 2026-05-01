// all import that needed in server
const express = require('express');
const dotenv = require('dotenv')
// Database connection import 
const DBConnection = require('./DBConnection')
const cors = require('cors')

// user Routes for login and signup 
const userRoutes = require('./routes/userRoutes')

// Appointment Routes for booking appointment and deny it
const apptRoutes = require('./routes/apptRoutes')

dotenv.config()

const app = express();

// cors for bypassing browser cors error
app.use(cors())
app.use(express.json())

// running database connection function that imported early 
DBConnection();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// running userRoutes on /api/user path
app.use('/api/user', userRoutes)

// running apptRoutes on /api/appointment path
app.use('/api/appointment', apptRoutes)

// importing port from env files
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

