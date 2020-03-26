const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.get('/', function (req, res) {

res.sendFile(__dirname+"/index.html");
});

app.post('/',function(req,res)
{
const collegeID=req.body.CollegeID;
const passWord=req.body.password;

});
app.get('/sign-up',function(req,res){

res.sendFile(_dirname+"/sign-up.html");
});

app.post('/sign-up',function(req,res){
const IDReg=req.body.CollegeIdReg;
const passWordReg=req.body.passWordReg;
const RePassword=req.body.RePassword;

});



app.listen(3000,function(req,res){

console.log("Server running on port 3000");


});