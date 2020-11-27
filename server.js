var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var morgan = require('morgan');
var mongoose = require('mongoose');

app.use(morgan('dev'));

mongoose.connect('mongodb://localhost:27017/tutorial', function() {
    if(err){
        console.log('Not connected to the database: ' + err);
    }else{
        console.log('Successfully connected');
    }
});
// app.get('/home', function(req,res){
//     res.send('Hello Thien');
// });

app.listen(port,function(){
    console.log('Running the server on port ' + port);
});