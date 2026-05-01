// Importing necessary things
const jwt = require('jsonwebtoken')
const userModel = require('../model/userModel')
const bcrypt = require('bcrypt')
const validator = require('validator')

// Controller for handling user sign-up
exports.signUpUser = async (req, res) => {
    // Extracting user details
    const { name, email, phone, password, role } = req.body;

    // getting user using its email
    const exist = await userModel.findOne({email})

    // Validating input fields
    if(!name || !email || !phone || !password || !role){
        res.json({ message: "All Fields are Mandatory!!" });
        return;
    }
    // Validating email format and checking password is Strong or not
    if(!validator.isEmail(email)){
        res.json({ message: "Email is not Valid!!" })
        return;
    }
    if(!validator.isStrongPassword(password)){
        res.json({ message: "Please Provide Strong Password!!" })
        return;
    }

    // If email already exists than sending message
    if(exist){
        res.json({ message: "Email Alreay Exist!" })
    }

    // Hashing the password before saving to database
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Creating a new user in the database
    try{
        const user = await userModel.create({name, email, phone, password: hash, role})
    }catch(error){
        // Handling any errors during user inserting in database
        throw Error("Database Error: User not Created!!")
    }
    // Sending response with the created user details
    res.json(exist)
}

// Controller for handling user login
exports.loginUser = async (req, res) => {
    // Extracting email and password
    const { email, password } = req.body;

    // getting user using its email
    const exist = await userModel.findOne({email})

    // checking if email exist or true
    if(!exist){
        res.json({ message: "Incorrect Email!!" })
        return;
    }

    // Comparing provided password with the hashed password in the database
    const match = await bcrypt.compare(password, exist.password)

    // If password does not match, sending error message
    if(!match){
        res.json({ message: "Incorrect Password!!" })
    }

    // Generating JWT token for authenticated user
    // i copied from jwt documentation
    const token = jwt.sign(
        {
            id: exist._id,
            role: exist.role
        },
        process.env.SECRET,
        {
            expiresIn: '3d'
        }
    )

    // Sending response with the token and user details
    res.json({
        message: "Login Succesful",
        token: token,
        user: {
            id: exist._id,
            name: exist.name,
            role: exist.role,
            email: exist.email
        }
    })
}

// Controller for fetching hosts
exports.getHosts = async (req, res) => {
    // Fetching all users with role employee
    try {
        const hosts = await userModel.find({ role: 'employee' }).select('name _id');
        res.json(hosts);
    } catch (error) {
        // Handling any errors
        res.status(500).json({ message: error.message });
    }
}