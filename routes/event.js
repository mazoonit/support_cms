const express = require("express");
const router = express.Router();
const prisma = require('../lib/prisma');
const event_service = require('../lib/events')

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