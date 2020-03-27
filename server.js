const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
app.use("view engine","ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/GrievanceDB', { useNewUrlParser: true, useUnifiedTopology: true });
const RegisterSchema = {

    fname: { type: String, },
    lname: { type: String },
    email: { type: String },
    phone: { type: String },
    gender: { type: String },
    DOB: { type: Date },
    
    collegeID: {
        type: String,
        unique: true
    },
    semester: { type: String },
    year: { type: String },
    program: { type: String },
    department: { type: String },

    password: { type: String },
    repassword: { type: String }


}
const registerModel = mongoose.model('student', RegisterSchema);



app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});


app.post('/', function (req, res) {
    var collegeID=req.body.collegeID;
    var password=req.body.password;
    registerModel.findById(collegeID,function(err,doc){
      if(doc.password==password)
      {
    res.redirect('/profile');}
    });
});

app.get('/sign-up', function (req, res) {
    res.sendFile(__dirname + "/sign-up.html");
});


app.post('/sign-up', function (req, res) {
    var password = req.body.password;
    var repassword = req.body.repassword;
    if (password == repassword) {
        var regStudent = new registerModel({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            phone: req.body.phone,
            DOB: req.body.DOB,
            collegeID: req.body.collegeID,
            semester: req.body.sem,
            year: req.body.year,
            program: req.body.program,
            department: req.body.department,
            password: req.body.password,
            repassword: req.body.repassword
        });
        regStudent.save(function (err) {
            if(err)
            {console.log(err);}
            else{
                res.redirect('/success');
            }

        });
    }
});
app.get('/')
app.listen(3000, function () {
    console.log("Server running on port 3000");
});