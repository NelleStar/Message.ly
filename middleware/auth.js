const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

/** Middleware: Authenticate user. */
// will not authenticate or reject a user but rather looking for a token, adding the payload to the user and returning next function - should use on every single route
function authenticateJWT(req, res, next) {
  try {
    // extract the toekn from the body
    const tokenFromBody = req.body._token;

    // verify the toekn using the key
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);

    // assign payload (user info) to use in other routes of app
    req.user = payload; 

    // continue to next middleware or route
    return next();
  } catch (err) {
    // if there was an error just continue to the next middleware or route without throwing an error
    return next();
  }
}

/** Middleware: Requires user is authenticated. */
// will check first for no user in the request body and will throw an unauthorized 401 error. Elese it will find the user and go to the next middleware or route 
function ensureLoggedIn(req, res, next) {
  // if req.user is falsy aka no user found
  if (!req.user) {

    // throw a 401 error
    return next({ status: 401, message: "Unauthorized" });
  } else {
    // a user has been found and we proceed as normal
    return next();
  }
}

/** Middleware: Requires correct username. */
// try catch block were we first check IF the req.user.username matches the request.params.username we return the next middleware func or route ELSE they dont match and we return an unauthorized 401 message.
// If we run into an error in the try block (aka no req.user found) we throw an unauthorized 401 message
function ensureCorrectUser(req, res, next) {
  try {
    // compare the username property of the req.user obj with the username parameter from the request URL
    if (req.user.username === req.params.username) {

      // if they match then proceed to next middleware func or route
      return next();
    } else {

      // if they dont match throw an error
      return next({ status: 401, message: "Unauthorized" });
    }
    
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser
};
