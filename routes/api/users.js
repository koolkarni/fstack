const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const { check, validationResult } = require('express-validator/check');
const User = require('../../models/User');
const normalize = require('normalize-url');

// @route POST api/user
// @desc Register user
// @access Public
router.post('/', [
    check('name', 'Name is required')
        .not()
        .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
        'password',
        'Please enter a valid password with min of 6 chars'
    ).isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email: email });

        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exist' }] })
        }
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });
        user = new User({
            name,
            email,
            avatar,
            password
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload, config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) {
                    throw err;
                } else {
                    res.json({ token })
                }
            }
        )
    } catch (err) {
        console.log(err);
        res.status(500).send('server error');
    }
});

module.exports = router;