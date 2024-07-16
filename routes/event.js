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

async function pointEventToContent(fileName, eventId, prop){
    if(!eventId){
      throw new Error("eventId is missing!");
    }
    eventId = parseInt(eventId);
    await prisma.event.findUniqueOrThrow({where: {id: eventId}});
    let obj = {}
    obj[prop] = fileName;
    await prisma.event.update({where:{id: eventId}, data:obj});

}

router.post("/upload_content", upload.single("file"), async (req, res, next)=>{
    try{
      let {eventId} = req.body;
      await pointEventToContent(req.fileName, eventId, 'content_path')
      res.json({ message: req.fileName });
    }
    catch(e){
      next(e);
    } 
});

router.post("/upload_image", upload.single("file"), async (req, res, next)=>{
  try{
    let {eventId} = req.body;
    await pointEventToContent(req.fileName, eventId, 'image_path')
    res.json({ message: req.fileName });
  }
  catch(e){
    next(e);
  } 
});

router.get("/", async (req, res, next) => {
  try {
    let events = await prisma.event.findMany({});
    res.send(events);
  }
  catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    let event = await prisma.event.findUniqueOrThrow({where: {id: parseInt(req.params.id)}});
    res.send(event);
  }
  catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    req.body.user = req.user;
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