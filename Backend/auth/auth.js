// auth is little bit hard to understand
// but i try to copy it from MERN Authentication & Security videos
// i can't explained it well but i try
const jwt = require('jsonwebtoken')

//this function is for checking the token and role of user
const authorize = (role = []) => {
    // returning whole arrow function
    return (req, res, next) => {
        // getting token from header
        const token = req.headers.authorization?.split(" ")[1];

        // if token is not present then return message
        if(!token){
            return res.json({ message: "No Token, authorization denied" })
        }

        // if token is present then verify it and check the role of user
        try{
            // this is code that i created in env file i think this function checking or comparing it
            const decoded = jwt.verify(token, process.env.SECRET);
            req.user = decoded;

            // if role is not empty and role of user is not in role array then send message
            if(role.length && !role.includes(req.user.role)){
                return res.json({ message: "Forbidden: you don't have access" })
            }
            next();
        }catch(error){
            res.json({ message: "Token is not Valid!!" })
        }
    }
}

module.exports = authorize;