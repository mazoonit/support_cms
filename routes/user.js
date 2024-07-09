const express = require("express");
const router = express.Router();
const prisma = require('../lib/prisma');
const {create_user, change_password} = require("../lib/users.js");

router.get("/", async (req, res) => {
  try{
    let users = await prisma.user.findMany({select: {id: true, user_name: true}});
    res.send(users);
  }
  catch(e){
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try{
    let user = await prisma.user.findUnique({where: {id: parseInt(req.params.id)},select: {id: true, user_name: true}});
    res.send(user)
  }
  catch(e){
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try{
    let user = await create_user(req.body);
    res.send(user)
  }
  catch(e){
    next(e);
  }
});

router.put("/", async (req, res, next) => {
  try{
    let user_id = req.body.id;
    if(!user_id){
      next(new Error("Id can not be null!"));
    }
    let data = {}
    Object.keys(req.body).forEach(key => {
      if(["role", "user_name"].includes(key)){
        data[key]= req.body[key];
      }
      else{
        next(new Error("Not supported key to update" + key));
      }
    })
    const updated_user = await prisma.user.update({
      where:{id: user_id},
      data: data
    })
    res.send(updated_user);
  }
  catch(e){
    next(e);
  }
});

router.post("/change_password", async (req, res, next) => {
  try{
    let {id, old_password, new_password} = req.body;
    if(!id || !new_password){
      next(new Error("id and new_password can not be null!"));
    }
    let current_user = req.user;
    await change_password({id: id, old_password: old_password, new_password: new_password, current_user})
    res.sendStatus(200);
  }
  catch(e){
    next(e);
  }
});

router.delete("/", async (req, res, next) => {
  try{
    let user_id = req.body.id;
    if(!user_id){
      next(new Error("id can not be null!"));
    }
    await prisma.user.delete({
      where: {
        id: user_id
      }
    })
    res.sendStatus(200);
  }
  catch(e){
    next(e);
  }
});


module.exports = router;