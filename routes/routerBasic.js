const express = require('express');
const controllerBasic = require('../controllers/controllerBasic');

const router = express.Router();

router.route('/')
    .get(controllerBasic.get_Home);

router.route('/register')
    .get(controllerBasic.get_Register);

router.route('/login')
    .get(controllerBasic.get_Login);

module.exports = router;