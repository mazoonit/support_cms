const express = require("express");
const router = express.Router();
const prisma = require('../lib/prisma');
const path = require('path');
const event_service = require('../lib/events');

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
    const fileName = file.fieldname + '-' + uniqueSuffix;
    req.fileName = fileName;
    cb(null, fileName)
  }
})


const upload = multer({ storage: storage });


router.post("/upload", upload.single("file"), async (req, res, next)=>{

    try{
    let {eventId} = req.body;
    if(!eventId){
      throw new Error("eventId is missing!");
    }
    eventId = parseInt(eventId);
    await prisma.event.findUniqueOrThrow({where: {id: eventId}});
    await prisma.event.update({where:{id: eventId}, data:{content_path: req.fileName}});
    res.json({ message: req.fileName });
    }
    catch(e){
      next(e);
    } 

});



router.get("/", async (req, res, next) => {
  try {
    let events = prisma.event.findMany({});
    res.send(events);
  }
  catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    let event = prisma.event.find_one({where: {id: req.params.id}});
    if(!event){
      throw new Error("Not Found");
    }
    res.send(event);
  }
  catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    req.body.user = req.user;
    console.log(req.body);
    let event = await event_service.create_event(req.body);
    res.send(event);
  }
  catch (e) {
    next(e);
  }
});

router.put("/", async (req, res, next) => {
  try {
    req.body.user = req.user;
    let event = await event_service.update_event(req.body);
    res.send(event)
  }
  catch (e) {
    next(e);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    let event_id = req.body.id;
    if(!event_id){
      next(new Error("id can not be null!"));
    }
    await prisma.event.delete({where: event_id})
    res.sendStatus(200);
  }
  catch (e) {
    next(e);
  }
});

module.exports = router;