const express = require('express');
const controllerBasic = require('../controllers/controllerBasic');

const router = express.Router();

router.route('/')
    .get(controllerBasic.get_Home);

router.route('/register')
    .get(controllerBasic.get_Register)
    .post(controllerBasic.post_Register);

router.route('/login')
    .get(controllerBasic.get_Login)
    .post(controllerBasic.post_Login);

router.route('/allBucchins')
    .get(controllerBasic.get_AllBookings)

router.route('/confirmYourEmail')
    .get(controllerBasic.get_confirmYourEmail)

router.route('/confirmYourEmail/:id')
    .get(controllerBasic.get_mailLinkClicked)
module.exports = router;