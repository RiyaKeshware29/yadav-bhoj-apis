const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.post('/user', userController.createUser);
router.get('/user/:uid?', userController.getUser);
router.get('/check-user/:phone_no', userController.checkUser);

module.exports = router;
