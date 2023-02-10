const express = require("express");
const router = express.Router();
const db = require("../models");

// Route for creating a new blog post
router.post("/new-post", (req, res) => {
  db.Post.create({
    title: req.body.title,
    content: req.body.content,
    UserId: req.session.user.id
  })
    .then(post => res.json(post))
    .catch(err => res.status(500).json(err));
});

// Route for retrieving all blog posts
router.get("/posts", (req, res) => {
  db.Post.findAll({
    include: [db.User]
  })
    .then(posts => res.json(posts))
    .catch(err => res.status(500).json(err));
});

// Route for handling user authentication
router.post("/login", (req, res) => {
  db.User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!user.validPassword(req.body.password)) {
        return res.status(401).json({ message: "Incorrect password" });
      }
      req.session.user = user;
      return res.json(user);
    })
    .catch(err => res.status(500).json(err));
});

// Route for handling user logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Successfully logged out" });
});

// Route for creating a new comment
router.post("/new-comment", (req, res) => {
  db.Comment.create({
    content: req.body.content,
    UserId: req.session.user.id,
    PostId: req.body.PostId
  })
    .then(comment => res.json(comment))
    .catch(err => res.status(500).json(err));
});

// Route for retrieving all comments for a specific post
router.get("/comments/:id", (req, res) => {
  db.Comment.findAll({
    where: {
      PostId: req.params.id
    },
    include: [db.User]
  })
    .then(comments => res.json(comments))
    .catch(err => res.status(500).json(err));
});

module.exports = router;
