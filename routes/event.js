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

async function pointEventToContent(fileName, event_id, prop){
    if(!event_id){
      throw new Error("event_id is missing!");
    }
    event_id = parseInt(event_id);
    await prisma.event.findUniqueOrThrow({where: {id: event_id}});
    let obj = {}
    obj[prop] = fileName;
    await prisma.event.update({where:{id: event_id}, data:obj});

}

router.post("/upload_content", upload.single("file"), async (req, res, next)=>{
    try{
      let {event_id} = req.body;
      await pointEventToContent(req.fileName, event_id, 'content_path')
      res.json({ message: req.fileName });
    }
    catch(e){
      next(e);
    } 
});

router.post("/upload_image", upload.single("file"), async (req, res, next)=>{
  try{
    let {event_id} = req.body;
    await pointEventToContent(req.fileName, event_id, 'image_path')
    res.json({ message: req.fileName });
  }
  catch(e){
    next(e);
  } 
});

router.get("/", async (req, res, next) => {
  try {
    let params = req.query;
    if(params.upcoming_flag){
      params.start_date = new Date();
    }
    if(params.past_flag){
      params.end_date = new Date();
    }
    let events = await prisma.event.findMany({
      where: {
        title: {contains: params.title},
        type: params.type,
        date: {
            gte: params.start_date ? new Date(params.start_date): undefined,
            lt: params.end_date ? new Date(params.end_date) : undefined
        }
      },
      include:{event_speakers: {include: {speaker: true}}}
    });
    res.send(events);
  }
  catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    let event = await prisma.event.findUniqueOrThrow({include:{event_speakers: {include: {speaker: true}}}});
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