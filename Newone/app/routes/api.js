var User = require("../models/user");

module.exports = function (router) {
  //USER REGISTRATION ROUTE
  router.post("/users", function (req, res) {
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    user.email = req.body.email;
    if (
      req.body.username == null ||
      req.body.password == '' ||
      req.body.username == '' ||
      req.body.password == null ||
      req.body.email == null ||
      req.body.email ==  ''
    ) {
      res.json({ success: false, message: 'Ensure username, email, and password were provided' });
    } else {
      user.save(function (err) {
        if (err) {
          res.json({success: false, message: 'Username or password already exist'});
        } else {
          res.send({success: true, message: 'User created!'});
        }
      });
    }
  });

  //USER LOGIN ROUTE
  router.post('/authenticate' , function(req, res){
    User.findOne({username: req.body.username}).select('email username password').exec(function(err, user){
      if(err) throw err;

      if(!user){
        res.json({success:false,message: 'Could not authenticate user'});
      }else if(user){

      }
    });
  });
  return router;
}
