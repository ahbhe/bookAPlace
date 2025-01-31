const express = require('express');
const controllerLogged = require('../controllers/controllerLogged.js');

const router = express.Router();

router.route('/allBucchins')
    .get(controllerLogged.get_AllBookingsLogged);

router.route('/manageBucchins')
    .get(controllerLogged.get_ManageBookings);

module.exports = router;