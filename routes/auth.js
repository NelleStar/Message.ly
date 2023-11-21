const express = require("express");
const ExpressError = require("../expressError");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const User = require("../models/user");

const router = new express.Router();

// POST /login - login: {username, password} => {token} Make sure to update their last-login! 
// using a try catch block for error handling
router.post("/login", async (req, res, next) => {
    try {
        // grabbing the username and password from the request object
        let {username, password} = req.body;
        // if we await a call the User class using the authenticate() method we created and pass in the username and password - this will confirm that the username and password are correct
        if (await User.authenticate(username, password)) {
            // we declare token to be a json web token sign() method inserting the username and the SECRETKEY
            let token = jwt.sign({username}, SECRET_KEY);
            // Update the instance of the user object's time stamp using the method created and passing in the username
            User.updateLoginTimestamp(username);
            // return the token 
            return res.json({token})
        } else {
            // if at any point the if statement stops we throw this express error
            throw new ExpressError("Invalid username/password", 400);
        }
    } catch(err) {
        // Throw this error if the try does not work1
        return next(err);
    }
})


// POST /register - register user: registers, logs in, and returns token.  {username, password, first_name, last_name, phone} => {token}
router.post("/register", async(req, res, next) => {
    try {
        // Deconstruct user details 
        const { username, password, first_name, last_name, phone } = req.body;

        // use the register method from User class
        const newUser = await User.register({
            username,
            password,
            first_name,
            last_name,
            phone
        });

        // Generate token upon successful registration
        const token = jwt.sign({ username }, SECRET_KEY);

        // Return token 
        return res.json({ token });
    } catch(err) {
        return next(err);
    }
})
