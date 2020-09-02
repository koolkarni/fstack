const express = require('express');
const auth = require('../../middleware/auth');
const config = require('config');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');


// @route POST api/posts
// @desc Create a post
// @access Private
router.post('/', [auth,
    [
        check('text', 'text is required')
            .not()
            .isEmpty()
    ]
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        try {
            const user = await User.findById(req.user.id).select('-password')
            const newPost = {
                user: req.user.id,
                text: req.body.text,
                name: user.name,
                avatar: user.avatar
            }

            let post = new Post(newPost);
            await post.save();
            res.json(post);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error')
        }

    });

// @route POST api/posts
// @desc get a post
// @access Private

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error')
    }
})

// @route POST api/posts/:id
// @desc get post by id
// @access Private

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }
        res.json(post);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' })
        }
        res.status(500).send('Server Error')
    }
})

// @route DELETE api/posts/:id
// @desc delete post by id
// @access Private

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "User not authorized" });
        }
        await post.remove();
        res.json({ msg: 'post deleted ' })
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' })
        }
        res.status(500).send('Server Error')
    }
})

// @route PUT api/posts/like/:id
// @desc Like post by id
// @access Private

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }
        if (post.like.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: 'post already liked' });
        }

        post.like.unshift({ user: req.user.id });

        await post.save();
        res.json(post.like)
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' })
        }
        res.status(500).send('Server Error')
    }
})

// @route PUT api/posts/like/:id
// @desc Like post by id
// @access Private

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }
        if (post.like.filter(like => like.user.toString() === req.user.id).length == 0) {
            return res.status(400).json({ msg: 'post has not yet been liked' });
        }

        const removeIndex = post.like.map(like => like.user.toString()).indexOf(req.user.id);
        post.like.splice(removeIndex, 1);

        await post.save();
        res.json(post.like)
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' })
        }
        res.status(500).send('Server Error')
    }
})

// @route POST api/posts/comment/:id
// @desc comment on a post
// @access Private
router.post('/comment/:id', [auth,
    [
        check('text', 'text is required')
            .not()
            .isEmpty()
    ]
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        try {
            const user = await User.findById(req.user.id).select('-password')
            const post = await Post.findById(req.params.id);

            const newComment = {
                user: req.user.id,
                name: user.name,
                avatar: user.avatar,
                text: req.body.text
            }
            post.comments.unshift(newComment);

            await post.save();
            res.json(post.comments);
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error')
        }

    });


// @route DELETE api/posts/comment/:id
// @desc delete post by id
// @access Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }
        const comment = post.comments
            .find(comment => comment.id.toString() === req.params.comment_id);
        if (!comment) {
            return res.status(404).json({ msg: "comment not found" })
        }
        if (comment.user.toString() !== req.user.id && req.user.id !== post.user.toString()) {
            return res.status(401).json({ msg: "User not authorized" });
        }
        const removeIndex = post.comments
            .map(comment => comment.user.toString())
            .indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments)
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'comment  not found' })
        }
        res.status(500).send('Server Error')
    }
})
module.exports = router;