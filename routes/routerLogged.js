const express = require('express');
const controllerLogged = require('../controllers/controllerLogged.js');

const router = express.Router();

router.route('/')
    .get(controllerLogged.get_Home);


module.exports = router;