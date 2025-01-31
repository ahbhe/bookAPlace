const express = require('express');
const controllerLogged = require('../controllers/controllerLogged.js');

const router = express.Router();

router.route('/allBucchins')
    .get(controllerLogged.get_AllBookingsLogged);

router.route('/manageBucchins')
    .get(controllerLogged.get_ManageBookings);

router.route('/myProfile')
    .get(controllerLogged.get_MyProfile);

module.exports = router;