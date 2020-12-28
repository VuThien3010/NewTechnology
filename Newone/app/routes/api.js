var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'harryporter';
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

module.exports = function (router) {

  var options = {
    auth: {
      api_user: '17110075@student.hcmute.edu.vn',
      api_key: 'Vuanhnguyet05062020@'
    }
  };

  var client = nodemailer.createTransport(sgTransport(options));

  //USER REGISTRATION ROUTE
  router.post("/users", function (req, res) {
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;
    user.name = req.body.name;
    user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
    if (
      req.body.username == null ||
      req.body.password == "" ||
      req.body.username == "" ||
      req.body.password == null ||
      req.body.email == null ||
      req.body.email == "" ||
      req.body.name == null ||
      req.body.name == ""
    ) {
      res.json({
        success: false,
        message: "Ensure username, email, and password were provided",
      });
    } else {
      user.save(function (err) {
        if (err) {
          if (err.errors = ! null) {
            if (err.errors.name) {
              res.json({
                success: false, message: err.errors.name.message,
              });
            } else if (err.errors.email) {
              res.json({
                success: false, message: err.errors.email.message,
              });
            } else if (err.errors.username) {
              res.json({
                success: false, message: err.errors.username.message,
              });
            } else if (err.errors.password) {
              res.json({
                success: false, message: err.errors.password.message,
              });
            } else {
              res.json({ success: false, message: err });
            }
          } else if (err) {
            if (err.code == 11000) {
              if (err.errmsg[61] == "u") {
                res.json({ success: false, message: 'That username is already taken' }); // Display error if username already taken
              } else if (err.errmsg[61] == "e") {
                res.json({ success: false, message: 'That e-mail is already taken' }); // Display error if e-mail already taken
              }
            } else {
              res.json({ success: false, message: err }); // Display any other error
            }
          }
        } else {
          var email = {
            from: 'Local staff, staff@localhost.com',
            to: user.email,
            subject: 'Localhost Activation Link',
            text: 'Hello' + user.name + 'Thanks you for registering at localhost.com. Please on the link below to complete your activation: http://localhost:8080/activate/' + user.temporarytoken,
            html: 'Hello<strong>' + user.name + '</strong>,<br><br> Thanks you for registering at localhost.com. Please on the link below to complete your activation: <br><br><a href="http://localhost:8080/activate/' + user.temporarytoken + '">http://localhost:8080/activate/</a>'
          };

          client.sendMail(email, function (err, info) {
            if (err) {
              console.log(err);
            }
            else {
              console.log('Message sent: ' + info.response);
            }
          });
          res.send({ success: true, message: 'Account registered! Please check your email for activation link.' });
        }
      });
    }
  });

  router.post('/checkusername', function (req, res) {
    User.findOne({ username: req.body.username })
      .select('username')
      .exec(function (err, user) {
        if (err) throw err;
        if (user) {
          res.json({ success: false, message: 'That username is already taken' });
        } else {
          res.json({ success: true, message: 'Valid username' });
        }
      });
  });

  router.post('/checkemail', function (req, res) {
    User.findOne({ email: req.body.email })
      .select('email')
      .exec(function (err, user) {
        if (err) throw err;
        if (user) {
          res.json({ success: false, message: 'That e-mail is already taken' });
        } else {
          res.json({ success: true, message: 'Valid e-mail' });
        }
      });
  });

  //USER LOGIN ROUTE
  router.post('/authenticate', function (req, res) {
    User.findOne({ username: req.body.username })
      .select("email username password active")
      .exec(function (err, user) {
        if (err) throw err;
        if (!user) {
          res.json({ success: false, message: "Could not authenticate user" });
        } else if (user) {
          if (req.body.password) {
            var validPassword = user.comparePassword(req.body.password);
          } else {
            res.json({ success: false, message: "No password provided" });
          }
          if (!validPassword) {
            res.json({
              success: false,
              message: "Could not authenticate password",
            });
          // } else if(!user.active){
          //   res.json({success: false, message:'Account is not yet actived. Please check your email'});
          } else {
            var token = jwt.sign(
              { username: user.username, email: user.email },
              secret,
              { expiresIn: '30s' }
            );
            res.json({
              success: true,
              message: "User authenticated!",
              token: token,
            });
          }
        }
      });
  });

  router.put('/activate/:token', function (req, res) {
    User.findOne({ temporarytoken: req.params.token }, function (err, user) {
      if (err) throw (err);
      var token = req.params.token;

      jwt.verify(token, secret, function (err, decoded) {
        if (err) {
          res.json({ success: false, message: 'Activation link is expired' });
        } else if (!user) {
          res.json({ success: false, message: 'Activation link is expired' });
        } else {
          user.temporarytoken = false;
          user.active = true;
          user.save(function (err) {
            if (err) {
              console.log(err);
            } else {
              var email = {
                from: 'local staff, staff@localhost.com',
                to: user.email,
                subject: 'Localhost Account Activated',
                text: 'Hello' + user.name + '</stronng>,<br><br>Your Account has been successfully activated',
                html: 'Hello<strong>' + user.name + '</stronng>,<br><br>Your Account has been successfully activated'
              };
              client.sendMail(email, function (err, info) {
                if (err) {
                  console.log(err);
                }
                else {
                  console.log('Message sent: ' + info.response);
                }
              });
              res.json({ success: true, message: ' Account activated' });
            }
          });
        }
      });
    });
  });

  router.use(function (req, res, next) {
    var token =
      req.body.token || req.body.query || req.headers["x-access-token"];

    if (token) {
      jwt.verify(token, secret, function (err, decoded) {
        if (err) {
          res.json({ success: false, message: "Token invalid" });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      res.json({ success: false, message: "No token provided" });
    }
  });
  router.post("/me", function (req, res) {
    res.send(req.decoded);
  });
  router.get('/renewToken/:username',function(req,res){
    User.findOne({username:req.params.username}).select().exec(function(err,user){
      if(err) throw err;
      if(!user){
        res.json({success: false, message: 'No user was found'});
      }else{
        var newToken = jwt.sign(
          { username: user.username, email: user.email },
          secret,
          { expiresIn: '24h' }
        );
        res.json({
          success: true,
          token: newToken,
        });
      }
    });
  });
  return router;
};
