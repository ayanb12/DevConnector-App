const express = require('express');
const router = express.Router();


// GET api/users/test, public route
router.get('/test', (req, res) => res.json({
	msg: "Users Works"
}));

module.exports = router;