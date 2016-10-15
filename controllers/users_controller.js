var bcrypt = require('bcryptjs');
var models  = require('../models');
var express = require('express');
var router  = express.Router();

//this is the users_controller.js file
router.get('/signup-signin', function(req,res) {
	res.render('users/signup-signin', {
		layout: 'main-registration'
	});
});

router.get('/sign-out', function(req,res) {
  req.session.destroy(function(err) {
     res.redirect('/')
  })
});


// login
router.post('/login', function(req, res) {
  models.User.findOne({
    where: {email: req.body.email}
  }).then(function(user) {

		if (user == null){
			res.redirect('/users/signup-signin');
		}

		// Solution:
		// =========
		// Use bcrypt to compare the user's password input
		// with the hash stored in the user's row. 
		// If the result is true, 
    bcrypt.compare(req.body.password, user.password_hash, function(err, result) {
      // if the result is true (and thus pass and hash match)
      if (result == true){

      	// save the user's information 
				// to req.session, as the comments below show 

				// so what's happening here?
				// we enter the user's session by setting properties to req.

				// we save the logged in status to the session
        req.session.logged_in = true;
        // the username to the session
				req.session.username = user.username;
				// the user id to the session
        req.session.user_id = user.id;
        // and the user's email.
        req.session.user_email = user.email;

        res.render('index', {
		      user_id: req.session.user_id,
		      email: req.session.user_email,
		      logged_in: req.session.logged_in,
		      username: req.session.username
				});
      }
      // if the result is anything but true (password invalid)
      else{
      	// redirect user to sign in
				res.redirect('/users/signup-signin')
			}
    })
  })
});


// register a user
router.post('/create', function(req,res) {
	models.User.findAll({
    where: {email: req.body.email}
  }).then(function(users) {

		if (users.length > 0){
			console.log(users)
			res.send('we already have an email or username for this account')
		} else {

			// Solution:
			// =========

			// Using bcrypt, generate a 10-round salt,
			// then use that salt to hash the user's password.
			bcrypt.genSalt(10, function(err, salt) {
				bcrypt.hash(req.body.password, salt, function(err, hash) {
					
					// Using the User model, create a new user,
					// storing the email they sent and the hash you just made
					models.User.create({
						email: req.body.email,
						password_hash: hash,
						username: req.body.username
					})
					// In a .then promise connected to that create method,
					// save the user's information to req.session
					// as shown in these comments
					.then(function(user){


						// so what's happening here?
						// we enter the user's session by setting properties to req.

						// we save the logged in status to the session
	          req.session.logged_in = true;
	          // the username to the session
						req.session.username = user.username;
						// the user id to the session
	          req.session.user_id = user.id;
	          // and the user's email.
	          req.session.user_email = user.email;

	          // redirect to home on login
						res.render('index', {
				      user_id: req.session.user_id,
				      email: req.session.user_email,
				      logged_in: req.session.logged_in,
				      username: req.session.username
    				});
					})
				})
			})
		}
	})
});

module.exports = router;
