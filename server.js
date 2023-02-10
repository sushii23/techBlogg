const express = require('express');
const session = require('express-session');
const sequelize = require('sequelize');
const connectSessionSequelize = require('connect-session-sequelize');
const MySQLStore = connectSessionSequelize(session.Store);
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Connect to database
const db = new sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

// Define User model
const User = db.define('user', {
  username: {
    type: sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: sequelize.STRING,
    allowNull: false,
  },
});

// Define Post model
const Post = db.define('post', {
  title: {
    type: sequelize.STRING,
    allowNull: false,
  },
  contents: {
    type: sequelize.TEXT,
    allowNull: false,
  },
});

// Define Comment model
const Comment = db.define('comment', {
  contents: {
    type: sequelize.TEXT,
    allowNull: false,
  },
});

// Define relationships between models
User.hasMany(Post);
Post.belongsTo(User);
Post.hasMany(Comment);
Comment.belongsTo(Post);
Comment.belongsTo(User);

// Initialize express app
const app = express();

// Middleware for handling sessions
const sessionStore = new MySQLStore({
  db: db,
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
}));

// Middleware for handling authentication
const checkAuth = (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
};

// Route for displaying homepage
app.get('/', (req, res) => {
  Post.findAll({
    include: [{
      model: User,
      attributes: ['username'],
    }],
  })
    .then((posts) => {
      res.render('homepage', { posts: posts });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error loading posts');
    });
});

// Route for displaying sign-up page
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Route for handling sign-up submissions
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  bcrypt
