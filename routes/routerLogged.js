const express = require('express');
const controllerLogged = require('../controllers/controllerLogged.js');
const utils = require('../config/utils.js');
const router = express.Router();

router.route('/allBucchins')
    .get(utils.userCheck, controllerLogged.get_AllBookingsLogged);

router.route('/manageBucchins')
    .get(utils.userCheck, controllerLogged.get_ManageBookings);

router.route('/myProfile')
    .get(utils.userCheck, controllerLogged.get_MyProfile);

router.route('/logout')
    .get(utils.userCheck, controllerLogged.get_Logout);

router.route('/newBucchin')
    .post(utils.userCheck, controllerLogged.post_CreateBooking);

/* router.route('/deleteBucchin/:id')
    .post(utils.userCheck, controllerLogged.delete_DeleteBooking); */

router.route('/deleteManyBucchins/:date')
    .post(utils.userCheck, controllerLogged.delete_DeleteManyBookings)

module.exports = router;