const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
var mysql = require('mysql');
var Blob = require('blob');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Document"
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected MYSQL");
});

// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

//Profile
router.get('/profile', forwardAuthenticated, (req,res) => res.render('profile'));


// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        var create = 'CREATE TABLE ' + name + ' (type VARCHAR(255),doc BLOB)';
        con.query(create, function (err, result) {
            if (err) throw err;
            console.log("Table created");
        });
        con.end(function(err) {
          if (err) {
            return console.log('error:' + err.message);
          }
          console.log('Close the database connection.');
        });
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  const {email, password} = req.body;
  var tname = email;
  var passw = password;
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});


// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;


router.post('/upload', (req, res) => {
    const {Type , file} = req.body;
    
    var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "document"
    });

    var table = tname;
    var type = Type;
    var upload = new Blob([file]);

    con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "INSERT INTO "+ table +" (type, doc) VALUES ( "+ type +" , " + upload +" )";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        });
    });

    con.end(function(err) {
        if (err) {
          return console.log('error:' + err.message);
        }
        console.log('Close the database connection.');
    });

    res.end();

})