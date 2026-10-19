const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Enable JSON Web Tokens

const tripsController = require('../controllers/trips');
const authController = require('../controllers/authentication');

// Method to authenticate our JWT
function authenticateJWT(req, res, next) {
  // console.log('In Middleware');

  const authHeader = req.headers['authorization'];
  // console.log('Auth Header: ' + authHeader);

  if (authHeader == null) {
    console.log('Auth Header Required but NOT PRESENT!');
    return res.sendStatus(401);
  }

  const headers = authHeader.split(' ');
  if (headers.length < 2) {
    console.log('Not enough tokens in Auth Header: ' + headers.length);
    return res.sendStatus(401);
  }

  const token = headers[1];
  // console.log('Token: ' + token);

  if (token == null) {
    console.log('Null Bearer Token');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
    if (err) {
      return res.status(401).json('Token Validation Error!');
    }
    req.auth = verified; // Set the auth param to the decoded object
    next();              // Only continue once the token has been verified
  });
}

// Authentication endpoints
router.route('/register').post(authController.register);
router.route('/login').post(authController.login);

router
  .route('/trips')
  .get(tripsController.tripsList)                        // public
  .post(authenticateJWT, tripsController.tripsAddTrip);  // protected

   router
     .route('/trips/:tripCode')
     .get(tripsController.tripsFindByCode)                      // public
     .put(authenticateJWT, tripsController.tripsUpdateTrip)     // protected
     .delete(authenticateJWT, tripsController.tripsDeleteTrip); // protected
    
module.exports = router;