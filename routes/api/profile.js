const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load validation
const validateProfileInput = require('../../validation/profile')
const validateExperienceInput = require('../../validation/experience')
const validateEducationInput = require('../../validation/education')

//Load profile model
const Profile = require('../../models/Profile')
//Load user
const User = require('../../models/User')


// GET api/profile/test, public route
router.get('/test', (req, res) => res.json({
	msg: "Profile Works"
}));

// GET api/profile/profile, get current user profile,,,private route
router.get('/', passport.authenticate('jwt', {
	session: false
}), (req, res) => {
	const errors = {};

	Profile.findOne({
			user: req.user.id
		})
		.populate('user', ['name', 'avatar'])
		.then(profile => {
			if (!profile) {
				errors.noprofile = 'There is no profile for this user'
				return res.status(404).json(errors)
			}
			res.json(profile);
		})
		.catch(err => res.status(404).json(err))
})

// POST api/profile/all, Get profile by all,,,public route
router.get('/all', (req, res) => {
	const errors = {};

	Profile.find()
		.populate('user', ['name', 'avatar'])
		.then(profiles => {
			if (!profiles) {
				errors.noprofile = 'There are no profiles';
				return res.status(404).json(errors)
			}

			res.json(profiles)
		})
		.catch(err => {
			res.status(404).json({
				profile: 'There are no profiles'
			})
		})
})


// POST api/profile/handle/:handle, Get profile by handle,,,public route
router.get('/handle/:handle', (req, res) => {
	const errors = {};
	Profile.findOne({
			handle: req.params.handle
		})
		.populate('user', ['name', 'avatar'])
		.then(profile => {
			if (!profile) {
				errors.noprofile = 'There is no profile for this user';
				res.status(404).json(error);
			}

			res.json(profile)
		})
		.catch(err => res.status(404).json(err))
})

// POST api/profile/user/:user_id, Get profile by user_id,,,public route
router.get('/user/:user_id', (req, res) => {
	const errors = {};
	Profile.findOne({
			user: req.params.user_id
		})
		.populate('user', ['name', 'avatar'])
		.then(profile => {
			if (!profile) {
				errors.noprofile = 'There is no profile for this user';
				res.status(404).json(error);
			}

			res.json(profile)
		})
		.catch(err => res.status(404).json({
			profile: 'There is no profile for this user'
		}))
})


// POST api/profile/profile, create user profile,,,private route
router.post('/', passport.authenticate('jwt', {
	session: false
}), (req, res) => {
	const {
		errors,
		isValid
	} = validateProfileInput(req.body)

	//check validation
	if (!isValid) {
		//Return any errors with 400 status
		return res.status(400).json(errors)
	}

	//Get fields
	const profileFields = {};
	profileFields.user = req.user.id
	if (req.body.handle) {
		profileFields.handle = req.body.handle
	}
	if (req.body.company) {
		profileFields.company = req.body.company
	}
	if (req.body.website) {
		profileFields.website = req.body.website
	}
	if (req.body.location) {
		profileFields.location = req.body.location
	}
	if (req.body.bio) {
		profileFields.bio = req.body.bio
	}
	if (req.body.status) {
		profileFields.status = req.body.status
	}
	if (req.body.githubusername) {
		profileFields.githubusername = req.body.githubusername
	}

	//split into array
	if (typeof req.body.skills !== 'undefined') {
		profileFields.skills = req.body.skills.split(',')
	}

	//social
	profileFields.social = {}
	if (req.body.youtube) {
		profileFields.social.youtube = req.body.youtube
	}
	if (req.body.twitter) {
		profileFields.social.twitter = req.body.twitter
	}
	if (req.body.facebook) {
		profileFields.social.facebook = req.body.facebook
	}
	if (req.body.linkedin) {
		profileFields.social.linkedin = req.body.linkedin
	}
	if (req.body.instagram) {
		profileFields.social.instagram = req.body.instagram
	}

	Profile.findOne({
			user: req.user.id
		})
		.then(profile => {
			if (profile) {
				//Update
				Profile.findOneAndUpdate({
						user: req.user.id
					}, {
						$set: profileFields
					}, {
						new: true
					})
					.then(profile => res.json(profile))
			} else {
				//Create

				//Check if handle exists
				Profile.findOne({
						handle: profileFields.handle
					})
					.then(profile => {
						if (profile) {
							errors.handle = 'That handle already exists';
							res.status(400).json(errors);
						}

						//save profile
						new Profile(profileFields).save().then(profile => res.json(profile))
					})
			}
		})

})


// POST api/profile/experience, Add experience to profile,,,private route	
router.post('/experience', passport.authenticate('jwt', {
	session: false
}), (req, res) => {
	const {
		errors,
		isValid
	} = validateExperienceInput(req.body);

	if (!isValid) {
		return res.status(400).json(errors);
	}

	Profile.findOne({
			user: req.user.id
		})
		.then(profile => {
			const newExp = {
				title: req.body.title,
				company: req.body.company,
				location: req.body.location,
				from: req.body.from,
				to: req.body.to,
				current: req.body.current,
				description: req.body.description
			}

			//Add to exp array
			profile.experience.unshift(newExp);

			profile.save().then(profile => res.json(profile))
		})
})


// POST api/profile/education, Add education to profile,,,private route	
router.post('/education', passport.authenticate('jwt', {
	session: false
}), (req, res) => {
	const {
		errors,
		isValid
	} = validateEducationInput(req.body);

	if (!isValid) {
		return res.status(400).json(errors);
	}

	Profile.findOne({
			user: req.user.id
		})
		.then(profile => {
			const newEdu = {
				school: req.body.school,
				degree: req.body.degree,
				fieldofstudy: req.body.fieldofstudy,
				from: req.body.from,
				to: req.body.to,
				current: req.body.current,
				description: req.body.description
			}

			//Add to exp array
			profile.education.unshift(newEdu);

			profile.save().then(profile => res.json(profile))
		})
})


// DELETE api/profile/experience/:exp_id, Delete experience from profile,,,private route	
router.delete('/experience/:exp_id', passport.authenticate('jwt', {
	session: false
}), (req, res) => {

	Profile.findOne({
			user: req.user.id
		})
		.then(profile => {
			//Get remove index
			const removeIndex = profile.experience
				.map(item => item.id)
				.indexOf(req.params.exp_id);
			console.log(removeIndex)

			//Splice out of array
			profile.experience.splice(removeIndex, 1)

			//save
			profile.save().then(profile => res.json(profile))
		})
		.catch(err => res.status(404).json(err));
})


// DELETE api/profile/education/:edu_id, Delete experience from profile,,,private route	
router.delete('/education/:edu_id', passport.authenticate('jwt', {
	session: false
}), (req, res) => {

	Profile.findOne({
			user: req.user.id
		})
		.then(profile => {
			//Get remove index
			const removeIndex = profile.education
				.map(item => item.id)
				.indexOf(req.params.edu_id);
			console.log(removeIndex)

			//Splice out of array
			profile.education.splice(removeIndex, 1)

			//save
			profile.save().then(profile => res.json(profile))
		})
		.catch(err => res.status(404).json(err));
})


// DELETE api/profile, Delete user and profile,,,private route	
router.delete('/', passport.authenticate('jwt', {
	session: false
}), (req, res) => {
	Profile.findOneAndRemove({
			user: req.user.id
		})
		.then(() => {
			User.findOneAndRemove({
					_id: req.user.id
				})
				.then(() => {
					res.json({
						success: true
					})
				})
		})
})


module.exports = router;