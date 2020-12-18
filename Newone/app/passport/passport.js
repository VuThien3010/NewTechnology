
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');
var session = require('express-session');
var jwt = require('jsonwebtoken');
var secret = 'harryporter';



module.exports = function (app, passport) {

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));

  passport.serializeUser(function (user, done) {
    token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: "24h" });
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use(new FacebookStrategy({
    clientID: '971093446627708',
    clientSecret: '75901c96bf3a7fcb6e6a18397c1ac26c',
    callbackURL: "http://localhost:8080/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
    function (accessToken, refreshToken, profile, done) {
      User.findOne({ email: profile._json.email }).select('username password email').exec(function (err, user) {
        if (err) done(err);

        if (user && user != null) {
          done(null, user);
        } else {
          done(err);
        }
      });
    }
  ));

  passport.use(new GoogleStrategy({
    clientID: '173229143143-553mldmvdejf1srhgqgsnti64vi91v72.apps.googleusercontent.com',
    clientSecret: 'gFyJuu1midTq2RrMbgRzJhAd',
    callbackURL: "http://localhost:8080/auth/google/callback"
  },
    function (accessToken, refreshToken, profile, done) {
      User.findOne({ email: profile._json.email }).select('username password email').exec(function (err, user) {
        if (err) done(err);

        if (user && user != null) {
          done(null, user);
        } else {
          done(err);
        }
      });
    }
  ));


  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/googleerror' }), function (req, res) {
    res.redirect('/google/' + token);
  });

  app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'profile', 'email'] }));

  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebookerror' }), function (req, res) {
    res.redirect('/facebook/' + token);
  });
  app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

  return passport;
}