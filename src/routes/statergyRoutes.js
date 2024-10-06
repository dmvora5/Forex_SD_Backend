const express = require('express');
const { runStatergyAction } = require('../controllers/statergyController');

const router = express.Router();

router.post("/run", runStatergyAction);

module.exports = router;