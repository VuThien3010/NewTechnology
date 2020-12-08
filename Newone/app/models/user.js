var moongose = require('mongoose');
var Schema = moongose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
    username: {type: String, lowercase: true, required: true, unique: true},
    password:  {type: String, required :true},
    email: {type: String, required: true, lowercase:true,unique:true}
});

UserSchema.pre('save', function(next){
    var user = this;
    bcrypt.hash(user.password, null, null, function(err,hash){
        if(err) return next(err);
        user.password = hash;
        next();
    });
});

UserSchema.methods.comparePassword.

module.exports = moongose.model('User',UserSchema)