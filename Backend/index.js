const express = require('express');
const dotenv = require('dotenv')
const DBConnection = require('./DBConnection')

const userRoutes = require('./routes/userRoutes')
const apptRoutes = require('./routes/apptRoutes')

dotenv.config()

const app = express();

app.use(express.json())
DBConnection();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/user', userRoutes)

app.use('/api/appointment', apptRoutes)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

