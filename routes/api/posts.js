const express = require('express');
const router = express.Router();

// GET api/posts/test, public route
router.get('/test', (req, res) => res.json({
	msg: "Posts Works"
}));

module.exports = router;