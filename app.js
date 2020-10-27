//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({ // change the Schema into a full mongose schema
  email: String,
  password: String
});

// add the mongoose-encryption plugin to the schema before creating mongoose model
//const secret = '...'; - add it to your .env file as SECRET=...
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']}); // encrypt only a certain field

const User = new mongoose.model('User', userSchema);


app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  })
  newUser.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.render('secrets'); // there is no get request for the secrets route because we do not want to show it to the user unless the user is registered/logged in
    }
  });
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser.password === password) {
        res.render('secrets');
      }
    }
  })
})




const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
