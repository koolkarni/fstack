const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const { response } = require('express');

// @route GET api/profile/me
// @desc Get current users profile
// @access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })
            .populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: "There is no profile for this user" });
        }
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error')
    }
});

router.post('/', [auth, [
    check('status', 'status is required')
        .not()
        .isEmpty(),
    check('skills', 'skills is required')
        .not()
        .isEmpty()]
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            facebook,
            twitter,
            linkedin
        } = req.body;

        //Build profile object
        const profileFields = {
        }
        profileFields.user = req.user.id;

        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;

        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }
        //build social obj

        profileFields.social = {}
        if (twitter) profileFields.social.twitter = twitter;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (facebook) profileFields.social.facebook = facebook;
        try {
            let profile = await Profile.findOne({ user: req.user.id })
            if (profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true });
                return res.json(profile)
            }
            profile = new Profile(profileFields);
            await profile.save();
            return res.json(profile);
        } catch (err) {
            console.error(err)
        }
    }
);

// @route GET api/profile
// @desc Get current all profiles
// @access Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        if (!profiles) {
            return res.status(400).json({ msg: "There is no profile for this user" });
        }
        res.json(profiles);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error')
    }
});

// @route GET api/profile/user/:user_id
// @desc Get profile by user id 
// @access Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: "There is no profile for this user" });
        }
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error')
    }
});

// @route DELETE api/profile
// @desc Delete profile user and posts 
// @access Private
router.delete('/', auth, async (req, res) => {
    try {
        await Profile.findOneAndDelete({ user: req.user.id });
        await User.findOneAndDelete({ _id: req.user.id });
        res.json({ msg: "User Deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error')
    }
});
// @route PUT api/profile/experience
// @desc add experience to profile 
// @access Private

router.put('/experience', [auth,
    [
        check('title', 'title is required')
            .not()
            .isEmpty(),
        check('company', 'company is required')
            .not()
            .isEmpty(),
        check('from', 'from date is required')
            .not()
            .isEmpty()
    ]
],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status('400').json({ errors: errors.array() })
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.unshift(newExp);
            await profile.save();
            res.json(profile);
        } catch (error) {
            console.error(err.message);
            res.status(500).send('server error');
        }

    });


// @route DELETE api/profile/experience/:exp_id
// @desc delete experience to profile 
// @access Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        return res.json(profile);


    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
})
// @route PUT api/profile/education
// @desc add experience to profile 
// @access Private

router.put('/education', [auth,
    [
        check('school', 'school is required')
            .not()
            .isEmpty(),
        check('degree', 'degree is required')
            .not()
            .isEmpty(),
        check('from', 'from date is required')
            .not()
            .isEmpty()
    ]
],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status('400').json({ errors: errors.array() })
        }
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.education.unshift(newEdu);
            await profile.save();
            res.json(profile);
        } catch (error) {
            console.error(err.message);
            res.status(500).send('server error');
        }

    });


// @route DELETE api/profile/educastion/:exp_id
// @desc delete experience to profile 
// @access Private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        return res.json(profile);


    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
})

// @route GET api/profile/github/:username
// @desc get user reposfrom github 
// @access Public

router.get('/github/:username', async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubclientid')}&client_secret=${config.get('githubsecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'nodejs' }
        };
        request(options, (error, response, body) => {
            if (error) console.error(error);

            if (response.statusCode !== 200) {
                return res.status(400).json({ msg: 'No git found' });
            }
            res.json(JSON.parse(body));
        });
    } catch (error) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

module.exports = router;