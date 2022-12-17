if(process.env.NODE_ENV !== 'production')
{
  require('dotenv').config();
}
var express = require('express');
var router = express.Router();

var db = require('../queries');
const users = require('./users')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = app => {
  app.use('/users', users)
  // app.use('/photos', photos)
  // etc..
}

// module.exports = router;
