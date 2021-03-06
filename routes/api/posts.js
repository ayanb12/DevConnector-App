const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');


//Post model
const Post = require('../../models/Post')

//profile model
const Profile = require('../../models/Profile')

//Validatiom
const validatePostInput = require('../../validation/post')

// GET api/posts/test, public route
router.get('/test', (req, res) => res.json({
	msg: "Posts Works"
}));


// GET api/posts, public route
router.get('/', (req, res) => {
	Post.find()
		.sort({
			date: -1
		})
		.then(posts => res.json(posts))
		.catch(err => res.status(404).json({
			nopostfound: 'No post found with that id'
		}))
})

// GET api/posts/:id, public route
router.get('/:id', (req, res) => {
	Post.findById(req.params.id)
		.then(posts => res.json(posts))
		.catch(err => res.status(404).json({
			nopostfound: 'No post found with that id'
		}))
})


// POST api/posts, private route
router.post('/', passport.authenticate('jwt', {
	session: false
}), (req, res) => {
	const {
		errors,
		isValid
	} = validatePostInput(req.body);

	//check validation
	if (!isValid) {
		//If any errors, send 400 with errors object
		return res.status(400).json(errors)
	}

	const newPost = new Post({
		text: req.body.text,
		name: req.body.name,
		avatar: req.body.avatar,
		user: req.user.id
	})

	newPost.save().then(post => res.json(post))
})


// DELETE api/posts/:id, private route
router.delete('/:id', passport.authenticate('jwt', {
	session: false
}), (req, res) => {
	Profile.findOne({
			user: req.user.id
		})
		.then(profile => {
			Post.findById(req.params.id)
				.then(post => {
					//check for post owner
					if (post.user.toString() !== req.user.id) {
						return res.status(401).json({
							notauthorized: 'User not authorized'
						})
					}

					//Delete
					post.remove().then(() => res.json({
						succes: true
					}))
				})
				.catch(err => res.status(404).json({
					postnotfound: 'No post found'
				}))
		})
})


// POST api/posts/like/:id, private route
router.post('/like/:id', passport.authenticate('jwt', {
	session: false
}), (req, res) => {
	Profile.findOne({
			user: req.user.id
		})
		.then(profile => {
			Post.findById(req.params.id)
				.then(post => {
					if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
						return res.status(400).json({
							alreadyliked: 'User already liked this post'
						})
					}

					//Add user id to likes array
					post.likes.unshift({
						user: req.user.id
					})

					post.save().then(post => res.json(post))
				})
				.catch(err => res.status(404).json({
					postnotfound: 'No post found'
				}))
		})
})


// POST api/posts/unlike/:id, private route
router.post('/unlike/:id', passport.authenticate('jwt', {
	session: false
}), (req, res) => {
	Profile.findOne({
			user: req.user.id
		})
		.then(profile => {
			Post.findById(req.params.id)
				.then(post => {
					if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
						return res.status(400).json({
							notliked: 'You have not yet liked this post'
						})
					}

					//Get remove index
					const removeIndex = post.likes.map(item => item.user.toString())
						.indexOf(req.user.id);

					//Splice out of the array
					post.likes.splice(removeIndex, 1);

					//save
					post.save().then(post => res.json(post))
				})
				.catch(err => res.status(404).json({
					postnotfound: 'No post found'
				}))
		})
})


// POST api/posts/comment/:id, private route
router.post('/comment/:id', passport.authenticate('jwt', {
	session: false
}), (req, res) => {
	const {
		errors,
		isValid
	} = validatePostInput(req.body);

	//check validation
	if (!isValid) {
		//If any errors, send 400 with errors object
		return res.status(400).json(errors)
	}

	Post.findById(req.params.id)
		.then(post => {
			const newComment = {
				text: req.body.text,
				name: req.body.name,
				avatar: req.body.avatar,
				user: req.user.id
			}

			//Add to comments array
			post.comments.unshift(newComment)

			//save
			post.save().then(post => res.json(post))
		})
		.catch(err => res.status(404).json({
			postnotfound: 'No post found'
		}))
})


// DELETE api/posts/comment/:id/comment_id, private route
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {
	session: false
}), (req, res) => {

	Post.findById(req.params.id)
		.then(post => {
			//check the comment exists
			if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
				return res.status(404).json({
					commentnotexists: 'Comment does not exist'
				})
			}

			//Get remove index
			const removeIndex = post.comments
				.map(item => item._id.toString())
				.indexOf(req.params.comment_id)

			//splice from the array
			post.comments.splice(removeIndex, 1);

			post.save().then(post => res.json(post))
		})
		.catch(err => res.status(404).json({
			postnotfound: 'No post found'
		}))
})

module.exports = router;