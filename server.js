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
//Date Formatting
function formatDate() {
    var date = new Date();
    var month_names = ["Jan", "Feb", "Mar",
        "Apr", "May", "Jun",
        "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec"];
    var month_digit = ["01", "02", "03",
        "04", "05", "06",
        "07", "08", "09",
        "10", "11", "12"];


    var day = date.getDate();
    var month_index = date.getMonth();
    var year = date.getFullYear();

    return "" + day + "-" + month_digit[month_index] + "-" + year;
}


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
    dateIssued: { type: String, },
    location: { type: String },
    section: { type: String },
    description: { type: String },
    dateResolved: { type: String },
    isSolved: { type: Boolean },
    adminFeedBack: { type: String },
    studentID: { type: Number },

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

//--------------------------------REGISTER COMPLAINT---------------------------------------------//

//register complaint route 
app.route('/profile-register')
    .get(function (req, res) {
        res.render("compsubmit", { name: fnamedoc + " " + lnamedoc, collegeID: collegeIDdoc })
    })
    .post(function (req, res) {

        var lodgedComplaint = new complaintModel({
            dateIssued: formatDate(),
            location: req.body.location,
            section: req.body.section,
            description: req.body.description,
            dateResolved: null,
            isSolved: false,
            studentID: collegeIDdoc,
            adminFeedBack: null
        })
        lodgedComplaint.save(function (err) {
            if (err) {
                console.log(err);
            }
            else {
                res.render('submitsuccess',{ name: fnamedoc + " " + lnamedoc, collegeID: collegeIDdoc })
            }
        });
    });
//--------------------------------------------ALL COMPLAINTS-----------------------------------------------------------//

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
    });
});

//Sending Json route  (Sorting)    PENDING
app.route('/complaints-pending/:location/:section')
    .get(function (req, res) {
        var location = req.params.location;
        var section = req.params.section;
        console.log(location);
        console.log(section);
        var filter = {};
        if (location == "All") { filter = { isSolved: false }; }
        else if (section == "All") {
            filter = { isSolved: false, location: location };

        }
        else {
            filter = { isSolved: false, location: location, section: section };
        }

        complaintModel.find(filter, function (err, docs) {
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
        var filter = {};
        if (location == "All") { filter = { isSolved: true }; }
        else if (section == "All") {
            filter = { isSolved: true, location: location };

        }
        else {
            filter = { isSolved: true, location: location, section: section };
        }

        complaintModel.find(filter, function (err, docs) {
            if (err) { console.log(err) }
            else {
                res.send(docs);
            }
        });
    }
    );

//------------------------------------------------MY COMPLAINTS-------------------------------------------------------//

//Profile Mycomplaints Pending
app.get('/profile-mycomplaints', function (req, res) {
    complaintModel.find({ studentID: collegeIDdoc, isSolved: false }, function (err, docs) {
        if (err) { console.log(err); }
        else {
            console.log(docs);
            res.render("profilemy", { name: fnamedoc + " " + lnamedoc, collegeID: collegeIDdoc, complaints: docs });

        }
    }

    );
});

//Profile Mycomplaints Solved
app.get('/profile-mycomplaints-solved', function (req, res) {
    complaintModel.find({ studentID: collegeIDdoc, isSolved: true }, function (err, docs) {
        if (err) { console.log(err); }
        else {
            console.log(docs);
            res.render("profilemysolved", { name: fnamedoc + " " + lnamedoc, collegeID: collegeIDdoc, complaints: docs });

        }
    }

    );
});
//Sending Json route  (Sorting)    PENDING
app.route('/complaints-pending-my/:location/:section')
    .get(function (req, res) {
        var location = req.params.location;
        var section = req.params.section;
        console.log(location);
        console.log(section);
        var filter = {};
        if (location == "All") { filter = { isSolved: false, studentID: collegeIDdoc }; }
        else if (section == "All") {
            filter = { isSolved: false, location: location, studentID: collegeIDdoc };

        }
        else {
            filter = { isSolved: false, location: location, section: section, studentID };
        }

        complaintModel.find(filter, function (err, docs) {
            if (err) { console.log(err) }
            else {
                res.send(docs);
            }
        });
    }
    );


//Sending Json route  (Sorting)            SOLVED 
app.route('/complaints-solved-my/:location/:section')
    .get(function (req, res) {
        var location = req.params.location;
        var section = req.params.section;
        console.log(location);
        console.log(section);
        var filter = {};
        if (location == "All") { filter = { isSolved: true, studentID: collegeIDdoc }; }
        else if (section == "All") {
            filter = { isSolved: true, location: location, studentID: collegeIDdoc };

        }
        else {
            filter = { isSolved: true, location: location, section: section, studentID: collegeIDdoc };
        }

        complaintModel.find(filter, function (err, docs) {
            if (err) { console.log(err) }
            else {
                res.send(docs);
            }
        });
    }
    );


//----------------------------------------- ADMIN-----------------------------------------------//

//Solved Complaint Sent By ADMIN
app.route('/solved-complaints')
    .post(function (req, res) {
        var id = req.body.id;
        var isSolved = req.body.isSolved;
        var feedback = req.body.feedback;
        console.log(id);
        console.log(isSolved);
        complaintModel.findOneAndUpdate({ _id: id, isSolved: false, }, { isSolved: true, dateResolved: formatDate(), adminFeedBack: feedback }, function (err) {
            if (err) {
                console.log(err);
            }
            else { console.log("Successfully solved the complaint") }

        });


    });



//GET COMPLAINTS
app.get('/admin', function (req, res) {
    complaintModel.find({ isSolved: false }, function (err, docs) {
        if (err) { console.log(err) }
        else {
            res.send(docs);
        }
    });
});
//ADMIN PAGE
app.get('/admin-page', function (req, res) {
    res.render('admin');

});





app.listen(3000, function () {
    console.log("Server running on port 3000");
});