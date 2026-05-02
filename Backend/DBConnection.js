// importing mongoose for database connection
const mongoose = require('mongoose')

// function for database connection
function DBConnection(){
    // getting database url from env file using proceess.env
    const DB_URL = process.env.MONGO_URI

    // connecting to database using mongoose connect function
    mongoose.connect(DB_URL);
    const db = mongoose.connection;

    db.on("error",console.error.bind(console,'Connection Error'))
    db.once("open",function(){
        console.log("Database Connected...");
    })
}

module.exports = DBConnection;