const jwt = require('jsonwebtoken')
const userModel = require('../model/userModel')
const bcrypt = require('bcrypt')
const validator = require('validator')

exports.signUpUser = async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    const exist = await userModel.findOne({email})

    if(!name || !email || !phone || !password || !role){
        res.json({ message: "All Fields are Mandatory!!" });
        return;
    }
    if(!validator.isEmail(email)){
        res.json({ message: "Email is not Valid!!" })
        return;
    }
    if(!validator.isStrongPassword(password)){
        res.json({ message: "Please Provide Strong Password!!" })
    }

    if(exist){
        res.json({ message: "Email Alreay Exist!" })
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    try{
        const user = await userModel.create({name, email, phone, password: hash, role})
    }catch(error){
        throw Error("Database Error: User not Created!!")
    }
    
    res.json(exist)
}

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    const exist = await userModel.findOne({email})

    if(!exist){
        res.json({ message: "Incorrect Email!!" })
        return;
    }

    const match = await bcrypt.compare(password, exist.password)

    if(!match){
        res.json({ message: "Incorrect Password!!" })
    }

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

    res.json({
        message: "Login Succesful",
        token: token,
        user: {
            name: exist.name,
            role: exist.role
        }
    })
}