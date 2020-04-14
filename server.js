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
    collegeID: { type: String },
    dateIssued: { type: Date, },
    location: { type: String },
    section: { type: String },
    description: { type: String },
    dateResolved: { type: Date },
    isSolved: { type: Boolean }

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
        res.redirect('/admin-page')
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

    complaintModel.find({ isSolved: false }, function (err, docs) {
        if (err) { console.log(err) }
        else {
            console.log(docs);
            res.render("profile", { name: fnamedoc + " " + lnamedoc, collegeID: collegeIDdoc, complaints: docs });

        }
    });

});

//Profile-Solved Route
app.get('/profile-solved', function (req, res) {
    complaintModel.find({ isSolved: true }, function (err, docs) {
        if (err) { console.log(err) }
        else {
            console.log(docs);
            res.render("profilesolved", { name: fnamedoc + " " + lnamedoc, collegeID: collegeIDdoc, complaints: docs });

        }
    });});






    //register complaint route 
    app.route('/profile-register')
        .get(function (req, res) {
            res.render("compsubmit", { name: fnamedoc + " " + lnamedoc, collegeID: collegeIDdoc })
        })
        .post(function (req, res) {
            var lodgedComplaint = new complaintModel({
                collegeID: collegeIDdoc,
                dateIssued: new Date(),
                location: req.body.location,
                section: req.body.section,
                description: req.body.description,
                dateResolved: null,
                isSolved: false
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


    //Sending Json route  (Sorting)    PENDING
    app.route('/complaints-pending/:location/:section')
        .get(function (req, res) {
            var location = req.params.location;
            var section = req.params.section;
            console.log(location);
            console.log(section);
            complaintModel.find({isSolved:false, location: location, section: section }, function (err, docs) {
                if (err) { console.log(err) }
                else {
                    res.send(docs);
                }
            });
        }
        );

    //Sending Json route  (Sorting)            SOLVED 
    app.route('/complaints-solved/:location/:section')
    .get(function (req, res) {
        var location = req.params.location;
        var section = req.params.section;
        console.log(location);
        console.log(section);
        complaintModel.find({ isSolved:true,location: location, section: section }, function (err, docs) {
            if (err) { console.log(err) }
            else {
                res.send(docs);
            }
        });
    }
    );

    //Solved Complaint
    app.route('/solved-complaints')
        .post(function (req, res) {
            var id = req.body.id;
            var isSolved = req.body.isSolved;
            console.log(id);
            console.log(isSolved);
            complaintModel.findOneAndUpdate({ _id: id, isSolved: false }, { isSolved: true, dateResolved: new Date() }, function (err) {
                if (err) {
                    console.log(err);
                }
                else { console.log("Successfully solved the complaint") }

            });


        });

    //Admin Route
    app.get('/admin', function (req, res) {
        complaintModel.find({ isSolved: false }, function (err, docs) {
            if (err) { console.log(err) }
            else {
                res.send(docs);
            }
        });
    });

    app.get('/admin-page', function (req, res) {
        res.render('admin');

    });

    app.listen(3000, function () {
        console.log("Server running on port 3000");
    });