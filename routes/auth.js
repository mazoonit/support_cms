const express = require("express");
const router = express.Router();
const {auth} = require("../lib/auth");

// Home page route.
router.post("/login", async (req, res, next) => {
  try{
    let token = await auth(req.body);
    console.log(token);
    res.cookie('token', token, { httpOnly: true });
    res.status(200).send({token});
  }
  catch(e){
    next(e);
  }
});

module.exports = router;