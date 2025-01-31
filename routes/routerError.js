const express = require('express')
const controllerError = require('../controllers/controllerError')

const router = express.Router()

router.route('/:err')
    .get(controllerError.get_errPage)

module.exports = router