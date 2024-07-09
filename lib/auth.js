const prisma = require('./prisma.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function verifyToken(req, res, next){
    let token = req.headers["authorization"].split(' ')[1];
    if(!token){
            res.status(401).send("Not Authorized");
            return;
    }
    jwt.verify(token, process.env.SECRET, async (err, decodedData)=>{
        if(err){
            res.status(401).send("Not Authorized");
        }
        else{
            req.user = await prisma.user.findUnique({where: {id: decodedData.data}})
            next();
        }
    });
    return;
}

async function auth({user_name, password}){
    if(!user_name || !password){
        throw new Error("Can't leave user_name or password blank!");
    }
    let user = await prisma.user.findUnique({where: {user_name: user_name}});

    if(!user){
        throw new Error("Not Authorized");
    }
    
    let rightPassword = await bcrypt.compare(password, user.password);
    if(!rightPassword){
        throw new Error("Not Authorized");
    }

    let token = await jwt.sign({
        data: user.id
    }, process.env.SECRET, { expiresIn: '1h' });
    
    return token;
}
module.exports = {verifyToken: verifyToken, auth: auth};