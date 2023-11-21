// require our database - bcrypt for password hashing and our express errors
const db = require("../db");
const bcrypt = require("bcrypt");
const ExpressError = require("../expressError");

// require our confing module our DB URI and how many times to hash 
const { DB_URI, BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */
class User {
  
  // register new user -- returns {username, password, first_name, last_name, phone}
  static async register({username, password, first_name, last_name, phone}) { 
    // create a hashed password from user input and our module from our config file
    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    // result is going to be an await where we insert the user information into our db - join_at and last_login_at are autocompleted with 
    const result = await db.query(
      `INSERT INTO users (
        username,
        password,
        first_name,
        last_name,
        phone,
        join_at,
        last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );
    // we need to return the result aka the newly registered user
    return result.rows[0]
  };

  /** Authenticate: is this username/password valid? Returns boolean. */
  static async authenticate(username, password) { 
    // first lets see if the username even exists
    const results = awaitdb.query(
      `SELECT username,
        password
      FROM users
      WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];

    // if no username found return false
    if(!user){
      return false;
    }

    // if we have gotten this far grab the hashed password from the user object and make a variable comparing the user input and the hashedpassword
    const hashedPasswordFromDB = user.password;
    const isPasswordValid = await bcrypt.compare(password, hashedPasswordFromDB);

    // will return true or false based on the bcrypt compare() method ran above
    return isPasswordValid;
  }

  /** Update last_login_at for user when they log back in!*/
  static async updateLoginTimestamp(username) { 
    // set the results variable to UPDATE the users table to reset the last_login for the user where the username matches the one given and return the username
    const results = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING username`,
      [username]);

      // if the username is not valid - throw an error
      if(!results.rows[0]) {
        throw new ExpressError(`No such user: ${username}, 404`);
      };
  }

  // All: basic info on all users: [{username, first_name, last_name, phone}, ...]
  static async all() { 
    // create a result variable where we are selecting the users with specific information from our db and ordering it by the username
    const results = await db.query(
      `SELECT username,
        first_name,
        last_name,
        phone
      FROM users
      ORDER BY username`
    );
    // returning all results
    return results.rows;
  };

  // Get: get user by username and returns {username, first_name, last_name, phone, join_at, last_login_at}
  static async get(username) { 
    // making an async call to our db to select a user based on a given username
    const results = await db.query(
      `SELECT username,
        first_name,
        last_name,
        phone,
        join_at,
        last_login_at
      FROM users 
      WHERE username = $1`,
      [username]
    );
    
    // save that user info to a variable
    const user = results.rows[0];

    // if user is falsy - meaning that there was not a user in our DB with that name then thrown an expressError
    if (!user) {
      throw new ExpressError (`No such user: ${username}`, 404);
    };

    // If we made it to here then return user
    return user;
  };

  // Return messages from this user - [{id, to_user, body, sent_at, read_at}]where to_user is {username, first_name, last_name, phone}
  static async messagesFrom(username) { 
    // Start with a query request that grabs specific columns from both messages and users tables using the username given
    const result = await db.query(
      `SELECT m.id,
                    m.to_username,
                    u.first_name,
                    u.last_name,
                    u.phone,
                    m.body,
                    m.sent_at,
                    m.read_at
              FROM messages AS m
                JOIN users AS u ON m.to_username = u.username
              WHERE from_username = $1`,
      [username]
    );

    // return the results from above but process the row return into the desired format of an array of objects where each object represents a msg sent by the user with an id, the user this msg was sent to, the body of the msg, the time it was sent and then again read
    return result.rows.map((m) => ({
      id: m.id,
      to_user: {
        username: m.to_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
  };

  // Return messages to this user - [{id, from_user, body, sent_at, read_at}]where from_user is {username, first_name, last_name, phone}
  static async messagesTo(username) { 
    // start with a query request to grab specific information from each table as needed and joined together using the given username
    const result = await db.query(
      `SELECT m.id,
              m.from_username,
              u.first_name,
              u.last_name,
              u.phone,
              m.body,
              m.sent_at,
              m.read_at
      FROM messages AS m
      JOIN users AS u ON m.from_username = u.username
      WHERE to_username = $1`,
      [username]
    );
    
    // return the results as a mapped array of objects wth the msg id, the user that sent the msg info, the msg infomration
    return result.rows.map((m) => ({
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
    }
};

module.exports = User;