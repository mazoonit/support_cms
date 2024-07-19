require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000
const eventRoutes = require('./routes/event.js');
const speakerRoutes = require('./routes/speaker.js');
const authRoutes = require('./routes/auth.js');
const userRoutes = require('./routes/user.js');
const {verifyToken} = require('./lib/auth.js');


const cookieParser = require('cookie-parser');

app.use(cookieParser());


// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Use a unique filename
  }
});

const upload = multer({ storage: storage }).fields([
  { name: 'images[0]', maxCount: 1 },
  { name: 'images[1]', maxCount: 1 },
  { name: 'images[2]', maxCount: 1 },
  { name: 'images[3]', maxCount: 1 },
  { name: 'images[4]', maxCount: 1 },
]);

app.use(express.json())

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');


app.use('/api/auth', authRoutes)
app.use('/api/event', [verifyToken, eventRoutes])
app.use('/api/speakers', [speakerRoutes])
// app.use('/api/user', [verifyToken, userRoutes])
app.use('/api/user', [userRoutes])
// app.get('/login', (req,res,next)=>{
//   res.render("login.ejs")
// })
app.get('/home' , verifyToken, (req,res,next)=>{
  res.render("home.ejs")
})

// app.get('/events', (req,res,next)=>{
//   res.render("events.ejs")
// })

app.get('/test', (req,res,next)=>{
  res.render("index.ejs")
})


// ejs views

app.get('/login', (req,res,next)=>{
  // res.render("template-login.ejs")
  res.render("auth-login-v3.ejs")
})

app.get('/page-add', (req,res,next)=>{
  res.render("final_page-add.ejs")
})

app.get('/page-list', (req,res,next)=>{
  res.render("final_page-list.ejs")
})

// app.get('/events', async (req,res,next)=>{
//   try {
//     const response = await fetch(`${req.protocol}://${req.get('host')}/api/event`);
//     const events = await response.json();
//     console.log(events)
//     res.render("final_page-list.ejs")
//   } catch (error) {
//     console.log(error)
//   }

// })

app.get('/events',verifyToken ,  (req,res,next)=>{
    res.render("final_page-list.ejs")
})

app.get('/events/add-event' , verifyToken , (req,res,next)=>{
  res.render("final_page-add.ejs")
})


app.get('*' , verifyToken , (req,res,next)=>{
  res.render("404.ejs")
})



// Route to handle form submission
// app.post('/add-page' ,  upload.array('images', 5), async (req, res) => {
//   try {
//     const {
//       title,
//       content,
//       tags,
//       slug,
//       categories,
//       parent,
//       date,
//       status,
//       allow_comments,
//       allow_pings,
//     } = req.body;

//     // Process form data
//     const newPage = {
//       title,
//       content,
//       tags,
//       slug,
//       categories,
//       parent,
//       date: "new Date(date.split('-').reverse().join('-'))", // Convert to Date object
//       status,
//       allow_comments: allow_comments === 'on',
//       allow_pings: allow_pings === 'on',
//     };

//     console.log(req.body , req.files , "dddddddddddd")

//     // // Save to the database
//     // await prisma.page.create({
//     //   data: newPage,
//     // });

//     res.redirect('/page-add'); // Redirect to a success page or the same form
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// });



app.post('/add-page', upload, (req, res) => {
  const { title, content, tags, slug, parent, date, status } = req.body;
  const images = req.files;

  // Process the rest of the form data and save it to the database or handle as needed
  // For demonstration, we'll log the data
  console.log('Title:', title);
  console.log('Content:', content);
  console.log('Tags:', tags);
  console.log('Slug:', slug);
  console.log('Parent:', parent);
  console.log('Date:', date);
  console.log('Status:', status);
  console.log('Images:', images);

  res.json({ message: 'Page added successfully', data: req.body, files: images });
});






// app.get('/events' , async (req, res, next) => {
//   // console.log(req , res , "/......")
//   try {
//     console.log(`${req.protocol}://${req.get('host')}/api/event`)
//     const response = await fetch(`${req.protocol}://${req.get('host')}/api/event`);
//     const events = await response.json();
//     console.log(events , "events")
//     // res.render("events.ejs", { events });
//   } catch (error) {
//     console.log(error)
//     next(error);
//   }
// });

app.use((err, req, res, next) => {
    console.log(err);
    if(err?.message == 'Not Authorized'){
      return res.sendStatus(401);
    }
    console.log(err , "err")
    if(err.errors || err.messages || err.message){
      console.log(err.message)
      return res.status(400).send({
        message: err.message
      })
      // return res.sendStatus(400);
    }
    res.sendStatus(500);
})

app.listen(PORT, () => console.log("Server started on port 3000"));