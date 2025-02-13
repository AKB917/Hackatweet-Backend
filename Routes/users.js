var express = require('express');
var router = express.Router();
var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/user');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


//---------------------------------------------------------------------------
//New User SignUp
//---------------------------------------------------------------------------
router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        password: hash,
        tokenUser: uid2(32),
        avatar: "avatar.jpg",
      });

      newUser.save().then(newDoc => {
        res.json({ result: true, newUser });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});


//---------------------------------------------------------------------------
//User SignUp
//---------------------------------------------------------------------------
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, user:data });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});

//---------------------------------------------------------------------------
//User SignUp
//---------------------------------------------------------------------------


module.exports = router;


