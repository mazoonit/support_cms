const express = require("express");
const router = express.Router();
const prisma = require('../lib/prisma');
const path = require('path');
const speaker_service = require('../lib/speakers');


/**
 * 
 * 
 * 
 * create, get, update, upload, addTospeaker, removeFromspeaker.
 */

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


router.post("/upload_image", upload.single("file"), async (req, res, next)=>{
  try{
    let {speaker_id} = req.body;
    if(!speaker_id){
      throw new Error("speaker_id is missing!");
    }
    speaker_id = parseInt(speaker_id);
    await prisma.speaker.findUniqueOrThrow({where: {id: speaker_id}});
    await prisma.speaker.update({where:{id: speaker_id}, data:{image_path: req.fileName}});
    res.json({ message: req.fileName });
  }
  catch(e){
    next(e);
  } 
});

router.get("/", async (req, res, next) => {
  try {
    let speakers = await prisma.speaker.findMany({});
    res.send(speakers);
  }
  catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    let speaker = await prisma.speaker.findUniqueOrThrow({where: {id: parseInt(req.params.id)}});
    res.send(speaker);
  }
  catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    req.body.user = req.user;
    let speaker = await speaker_service.create_speaker(req.body);
    res.send(speaker);
  }
  catch (e) {
    next(e);
  }
});

router.post("/createWithImage", upload.single("file"), async (req, res, next)=>{
  try{
    req.body.user = req.user;
    req.body.image_path = req.fileName;
    let speaker = await speaker_service.create_speaker(req.body);
    res.send(speaker);
  }
  catch(e) {
    next(e);
  }
});

router.put("/", async (req, res, next) => {
  try {
    req.body.user = req.user;
    let speaker = await speaker_service.update_speaker(req.body);
    res.send(speaker)
  }
  catch (e) {
    next(e);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    let speaker_id = req.body.id;
    if(!speaker_id){
      next(new Error("id can not be null!"));
    }
    await prisma.speaker.delete({where: speaker_id})
    res.sendStatus(200);
  }
  catch (e) {
    next(e);
  }
});

router.post("/attach_to_event", async (req, res, next) => {
  try {
    let {speaker_id, event_id} = req.body;
    speaker_id = parseInt(speaker_id);
    event_id = parseInt(event_id);
    if(!speaker_id || !event_id){
      throw new Error("speaker_id AND event_id are required!");
    }
    let speaker = await prisma.speaker.findUniqueOrThrow({where: {id: speaker_id}});
    let event = await prisma.event.findUniqueOrThrow({where: {id: event_id}});
    let is_attached = await prisma.eventSpeaker.findFirst({where: {speaker_id: speaker_id, event_id: event_id}});
    if(is_attached){
      throw new Error("Already attached!");
    }
    await prisma.eventSpeaker.create({
      data:{
        speaker_id: speakder_id,
        event_id: event_id
      }
    })
    res.send(speaker);
  }
  catch (e) {
    next(e);
  }
});

router.post("/remove_from_event", async (req, res, next) => {
  try {
    let {speaker_id, event_id} = req.body;
    speaker_id = parseInt(speaker_id);
    event_id = parseInt(event_id);
    if(!speaker_id || !event_id){
      throw new Error("speaker_id AND event_id are required!");
    }
    let speaker = await prisma.speaker.findUniqueOrThrow({where: {id: speaker_id}});
    let event = await prisma.event.findUniqueOrThrow({where: {id: event_id}});
    await prisma.eventSpeaker.deleteMany({
      where: {
        event_id: event_id,
        speaker_id: speaker_id
      }
    })
    res.send(speaker);
  }
  catch (e) {
    next(e);
  }
});



module.exports = router;