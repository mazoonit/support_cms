const prisma = require('./prisma.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function verifyToken(req, res, next){
    // console.log(req.cookies , req.headers["authorization"] , "req.headers[]")
    // const token = req.cookies?.token || req.headers.authorization && req.headers.authorization.split(' ')[1];
    const token = req.cookies?.token 

    // const authorization = req.headers["authorization"]

    // if(!authorization) {
    //     // res.status(401).send({
    //     //     message:"Not Authorized"}
    //     //     );
    //     // return;
    //     return res.redirect('/login');
    // }

    // let token = authorization.split(' ')[1];
    if(!token){
            // res.status(401).send({
            //     message:"Not Authorized"});
            // return;
            return res.redirect('/login');
    }
    jwt.verify(token, process.env.SECRET, async (err, decodedData)=>{
        if(err){
            // res.status(401).send("Not Authorized");

            return res.redirect('/login');
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