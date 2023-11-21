// require express so we can use router - our User class from user.js in the models folder and our modules from our middleware auth folder 
const express = require("express");
const User = require("../models/user");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

// create a new instance of an express router and assign to variable for user within this file
const router = new express.Router();

// GET '/' a list of ALL users => {users: [{username, first_name, last_name, phone}, ...]}
// try catch block used for an async func - we first try to create a variable called users which is awaiting a promise from the User class which is calling a static method of the class and not instance
router.get("/", async function(req, res, next) {
    try {
        const users = await User.all();
        return res.json({users});
    } catch(err) {
        return next(err);
    };
});



// GET /:username - get detail of users => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
// try catch block as an async function for error handling - first we create an instance of the user based on an await static method .get() from the User class using the params fromt he request
// if we get a positive response/promise back we return the user object and if we dont we return the next err
router.get("/:username", async function(req, res, next) {
    try {
        const user = await User.get(req.params.username);
        return res.json({user})
    } catch(err) {
        return next(err);
    };
});


//GET /:username/to - get messages to user {messages: [{id, body, sent_at,read_at, from_user: {username, first_name, last_name, phone}}, ...]}
//Try and catch block as an async function for error handling - first we create an instance of the messagesTo based on the method in the User class using the username param 
router.get("/:username/to", async (req, res, next) => {
    try {
        const messagesTo = await User.messagesTo(req.params.username);
        return res.json({messagesTo})
    } catch(err) {
        return next(err)
    }
})


// GET /:username/from - get messages from user => {messages: [{id, body,  sent_at, read_at, to_user: {username, first_name, last_name, phone}}, ...]}
router.get("/:username/to", async (req, res, next) => {
  try {
    const messagesTo = await User.messagesGet(req.params.username);
    return res.json({ messagesTo });
  } catch (err) {
    return next(err);
  }
});