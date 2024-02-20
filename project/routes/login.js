const express = require('express');
const router = express.Router();
const passport = require('passport')

router.post('/', passport.authenticate('localLogin',{
    successRedirect:'/profile'
})) 


module.exports = router;
