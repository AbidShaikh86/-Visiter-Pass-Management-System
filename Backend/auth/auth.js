const jwt = require('jsonwebtoken')

const authorize = (role = []) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(" ")[1];

        if(!token){
            return res.json({ message: "No Token, authorization denied" })
        }

        try{
            const decoded = jwt.verify(token, process.env.SECRET);
            req.user = decoded;

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