const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
app.set("view engine", "ejs");
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

var collegeIDdoc;
var fnamedoc;
var lnamedoc;
var password;
var repassword;

mongoose.connect('mongodb://localhost:27017/GrievanceDB', { useNewUrlParser: true, useUnifiedTopology: true });
//Schema for Student Data
const RegisterSchema = {
    _id: {
        type: Number,
        require: true
    },
    fname: { type: String, },
    lname: { type: String },
    email: { type: String },
    phone: { type: String },
    gender: { type: String },
    DOB: { type: Date },


    semester: { type: String },
    year: { type: String },
    program: { type: String },
    department: { type: String },

    password: { type: String },
    repassword: { type: String }
};

//Schema for Complaint 
const ComplaintSchema = {
    _id: {
        type: String,
        require: true
    },
    collegeID: { type: String },
    dateIssued: { type: Date, },
    section: { type: String },
    complaintText: { type: String },
    dateResolved: { type: Date }

}

//StudentModel
const registerModel = mongoose.model('student', RegisterSchema);
//ComplaintModel
const complaintModel = mongoose.model('complaint', ComplaintSchema);

// Home(Login) route
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post('/', function (req, res) {
    var collegeIDlogin = req.body.collegeID;
    var passwordlogin = req.body.password;
    if (collegeIDlogin == "admin" && passwordlogin == "admin") {
        res.redirect('/admin')
    }
    else {
        registerModel.findById(collegeIDlogin, function (err, doc) {
            if (doc.password == passwordlogin) {
                collegeIDdoc = doc._id;
                fnamedoc = doc.fname;
                lnamedoc = doc.lname;

                res.redirect('/profile');
            }
        });
    }
});

//sign-up Route
app.get('/sign-up', function (req, res) {
    res.sendFile(__dirname + "/sign-up.html");
});


app.post('/sign-up', function (req, res) {

    password = req.body.password;
    repassword = req.body.repassword;
    if (password == repassword) {
        var regStudent = new registerModel({
            _id: req.body.collegeID,
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            phone: req.body.phone,
            DOB: req.body.DOB,
            semester: req.body.sem,
            year: req.body.year,
            program: req.body.program,
            department: req.body.department,
            password: req.body.password,
            repassword: req.body.repassword
        });
        regStudent.save(function (err) {
            if (err) { console.log(err); }
            else {
                res.redirect('/success');
            }
            app.get('/success', function (req, res) { res.sendFile(__dirname + "/success.html"); });
        });
    }
});

//Profile Route
app.get('/profile', function (req, res) {

    res.render("profile", { name: fnamedoc + " " + lnamedoc, collegeID: collegeIDdoc });

});

var complaintID = 0;
app.post('/profile', function (req, res) {
    complaintID += 1;
    var lodgedComplaint = new complaintModel({

        _id: complaintID,
        collegeID: collegeIDdoc,
        dateIssued: new Date(),
        section: req.body.section,
        complaintText: req.body.complaint,
        dateResolved: null
    })
    lodgedComplaint.save(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Success");
        }
    });
});

//Admin Route
app.get('/admin', function (req, res) {
    complaintModel.find(function (err, docs) {
        if (err) { console.log(err) }
        else {
            console.log(docs);
            res.render("admin", {complaints:docs});

        }

    });

});

app.listen(3000, function () {
    console.log("Server running on port 3000");
});