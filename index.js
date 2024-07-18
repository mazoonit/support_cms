require('dotenv').config()
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000
const eventRoutes = require('./routes/event.js');
const speakerRoutes = require('./routes/speaker.js');
const authRoutes = require('./routes/auth.js');
const userRoutes = require('./routes/user.js');
const {verifyToken} = require('./lib/auth.js');

app.use(express.json())
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');


app.use('/api/auth', authRoutes)
app.use('/api/event', [verifyToken, eventRoutes])
app.use('/api/speaker', [verifyToken, speakerRoutes])
app.use('/api/user', [verifyToken, userRoutes])
app.get('/login', (req,res,next)=>{
  res.render("login.ejs")
})
app.get('/home', (req,res,next)=>{
  res.render("home.ejs")
})

app.use((err, req, res, next) => {
    if(err?.message == 'Not Authorized'){
      return res.sendStatus(401);
    }
    if(err.errors || err.messages || err.message){
      return res.sendStatus(400);
    }
    res.sendStatus(500);
})

app.listen(PORT, () => console.log("Server started on port 3000"));