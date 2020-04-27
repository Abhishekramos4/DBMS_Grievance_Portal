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
// function formatDate() {
//     var date = new Date();
//     var month_names = ["Jan", "Feb", "Mar",
//         "Apr", "May", "Jun",
//         "Jul", "Aug", "Sep",
//         "Oct", "Nov", "Dec"];
//     var month_digit = ["01", "02", "03",
//         "04", "05", "06",
//         "07", "08", "09",
//         "10", "11", "12"];


//     var day = date.getDate();
//     var month_index = date.getMonth();
//     var year = date.getFullYear();

//     return "" + day + "-" + month_digit[month_index] + "-" + year;
// }


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
    dateIssued: { type: Date, },
    location: { type: String },
    section: { type: String },
    description: { type: String },
    dateResolved: { type: Date },
    isSolved: { type: Boolean },
    adminFeedBack: { type: String },
    studentID: { type: Number },
    inProgress: { type: Boolean },

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
            dateIssued: new Date(),
            location: req.body.location,
            section: req.body.section,
            description: req.body.description,
            dateResolved: null,
            isSolved: false,
            studentID: collegeIDdoc,
            adminFeedBack: null,
            inProgress: false
        })
        lodgedComplaint.save(function (err) {
            if (err) {
                console.log(err);
            }
            else {
                res.render('submitsuccess', { name: fnamedoc + " " + lnamedoc, collegeID: collegeIDdoc })
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
app.route('/complaints-pending/:location/:section/:duration')
    .get(function (req, res) {
        var location = req.params.location;
        var section = req.params.section;
        var duration = req.params.duration;
        console.log(location);
        console.log(section);
        var filter = {};
        if (duration == "month") {
            var today = new Date();
            var deadline = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            filter = {
                dateIssued: {
                    $gte: new Date(deadline.toISOString()),
                    $lt: new Date(today.toISOString())
                }
            }
        }
        else if (duration == "week") {
            var today = new Date();
            var deadline = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            filter = {
                dateIssued: {
                    $gte: new Date(deadline.toISOString()),
                    $lt: new Date(today.toISOString())
                }
            }
        }
        else if (duration = 'today') {
            var today = new Date();
            var deadline = today.setHours(0, 0, 0, 0);
            var formatDeadline = new Date(deadline);
            filter = {
                dateIssued: {
                    $gte: new Date(formatDeadline.toISOString()),
                    $lt: new Date(today.toISOString())
                }
            }

        }
        if (location == "All") {
            filter.isSolved = false
            // filter = { isSolved: false }; 
        }
        else if (section == "All") {
            // filter = { isSolved: false, location: location };
            filter.isSolved = false;
            filter.location = location;

        }
        else {
            // filter = { isSolved: false, location: location, section: section };
            filter.isSolved = false;
            filter.location = location;
            filter.section = section;
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
app.route('/complaints-solved/:location/:section/:duration')
    .get(function (req, res) {
        var location = req.params.location;
        var section = req.params.section;
        var duration = req.params.duration;
        console.log(location);
        console.log(section);
        var filter = {};
        if (duration == "month") {
            var today = new Date();
            var deadline = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            filter = {
                dateIssued: {
                    $gte: new Date(deadline.toISOString()),
                    $lt: new Date(today.toISOString())
                }
            }
        }
        else if (duration == "week") {
            var today = new Date();
            var deadline = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            filter = {
                dateIssued: {
                    $gte: new Date(deadline.toISOString()),
                    $lt: new Date(today.toISOString())
                }
            }
        }
        else if (duration == 'today') {
            var today = new Date();
            var deadline = today.setHours(0, 0, 0, 0);
            var formatDeadline = new Date(deadline);
            filter = {
                dateIssued: {
                    $gte: new Date(formatDeadline.toISOString()),
                    $lt: new Date(today.toISOString())
                }
            }

        }
        if (location == "All") {
            filter.isSolved = true;
            // filter = { isSolved: false }; 
        }
        else if (section == "All") {
            // filter = { isSolved: false, location: location };
            filter.isSolved = true;
            filter.location = location;

        }
        else {
            // filter = { isSolved: false, location: location, section: section };
            filter.isSolved = true;
            filter.location = location;
            filter.section = section;
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
app.route('/complaints-pending-my/:location/:section/:duration')
    .get(function (req, res) {
        var location = req.params.location;
        var section = req.params.section;
        var duration = req.params.duration;
        console.log(location);
        console.log(section);
        var filter = {};
        if (duration == "month") {
            var today = new Date();
            var deadline = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            filter = {
                dateIssued: {
                    $gte: new Date(deadline.toISOString()),
                    $lt: new Date(today.toISOString())
                }
            }
        }
        else if (duration == "week") {
            var today = new Date();
            var deadline = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            filter = {
                dateIssued: {
                    $gte: new Date(deadline.toISOString()),
                    $lt: new Date(today.toISOString())
                }
            }
        }
        else if (duration == 'today') {
            var today = new Date();
            var deadline = today.setHours(0, 0, 0, 0);
            var formatDeadline = new Date(deadline);
            filter = {
                dateIssued: {
                    $gte: new Date(formatDeadline.toISOString()),
                    $lt: new Date(today.toISOString())
                }
            }

        }
        if (location == "All") {
            filter.isSolved = false;
            filter.collegeID = collegeIDdoc;
            // filter = { isSolved: false }; 
        }
        else if (section == "All") {
            // filter = { isSolved: false, location: location };
            filter.isSolved = false;
            filter.location = location;
            filter.collegeID = collegeIDdoc;

        }
        else {
            // filter = { isSolved: false, location: location, section: section };
            filter.isSolved = false;
            filter.location = location;
            filter.section = section;
            filter.collegeID = collegeIDdoc;
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
app.route('/complaints-solved-my/:location/:section/:duration')
    .get(function (req, res) {
        var location = req.params.location;
        var section = req.params.section;
        var duration = req.params.duration;
        console.log(location);
        console.log(section);
        var filter = {};
        if (duration == "month") {
            var today = new Date();
            var deadline = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            filter = {
                dateIssued: {
                    $gte: new Date(deadline.toISOString()),
                    $lt: new Date(today.toISOString())
                }
            }
        }
        else if (duration == "week") {
            var today = new Date();
            var deadline = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            filter = {
                dateIssued: {
                    $gte: new Date(deadline.toISOString()),
                    $lt: new Date(today.toISOString())
                }
            }
        }
        else if (duration == "week") {
            var today = new Date();
            var deadline = today.setHours(0, 0, 0, 0);
            var formatDeadline = new Date(deadline);
            filter = {
                dateIssued: {
                    $gte: new Date(formatDeadline.toISOString()),
                    $lt: new Date(today.toISOString())
                }
            }

        }
        if (location == "All") {
            filter.isSolved = true;
            filter.collegeID = collegeIDdoc;
            // filter = { isSolved: false }; 
        }
        else if (section == "All") {
            // filter = { isSolved: false, location: location };
            filter.isSolved = true;
            filter.location = location;
            filter.collegeID = collegeIDdoc;

        }
        else {
            // filter = { isSolved: false, location: location, section: section };
            filter.isSolved = true;
            filter.location = location;
            filter.section = section;
            filter.collegeID = collegeIDdoc;
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

//Complaint Sent By ADMIN to InProgress
app.route('/inprogress-complaints')
    .post(function (req, res) {
        var id = req.body.id;
        var inProgress = req.body.inProgress;

        console.log(id);
        console.log(isSolved);
        complaintModel.findOneAndUpdate({ _id: id, inProgress: false, }, { inProgress: true }, function (err) {
            if (err) {
                console.log(err);
            }
            else { console.log("Successfully sent the complaint ") }

        });


    });


app.route('/solved-complaints')
    .post(function (req, res) {
        var id = req.body.id;
        var isSolved = req.body.isSolved;
        var feedback = req.body.feedback;
        console.log(id);
        console.log(isSolved);
        complaintModel.findOneAndUpdate({ _id: id, isSolved: false, }, { isSolved: true, dateResolved: new Date(), adminFeedBack: feedback }, function (err) {
            if (err) {
                console.log(err);
            }
            else { console.log("Successfully solved the complaint") }

        });


    });


//GET COMPLAINTS
// app.get('/admin', function (req, res) {


//     complaintModel.find({ isSolved: false }, function (err, docs) {
//         if (err) { console.log(err) }
//         else {
//             res.send(docs);
//         }
//     });
// });

//GET  COMPLAINTS to In Progress
app.get('/admin/:location/:section/:duration', function (req, res) {
    var location = req.params.location;
    var section = req.params.section;
    var duration = req.params.duration;
    console.log(location);
    console.log(section);
    var filter = {};
    if (duration == "month") {
        var today = new Date();
        var deadline = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        filter = {
            dateIssued: {
                $gte: new Date(deadline.toISOString()),
                $lt: new Date(today.toISOString())
            }
        }
    }
    else if (duration == "week") {
        var today = new Date();
        var deadline = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        filter = {
            dateIssued: {
                $gte: new Date(deadline.toISOString()),
                $lt: new Date(today.toISOString())
            }
        }
    }
    else if (duration == 'today') {
        var today = new Date();
        var deadline = today.setHours(0, 0, 0, 0);
        var formatDeadline = new Date(deadline);
        filter = {
            dateIssued: {
                $gte: new Date(formatDeadline.toISOString()),
                $lt: new Date(today.toISOString())
            }
        }

    }
    if (location == "All") {
        filter.isSolved = false;
        filter.inProgress = false;
        // filter = { isSolved: false }; 
    }
    else if (section == "All") {
        // filter = { isSolved: false, location: location };
        filter.isSolved = false;
        filter.inProgress = false;
        filter.location = location;

    }
    else {
        // filter = { isSolved: false, location: location, section: section };
        filter.isSolved = false;
        filter.inProgress = false;
        filter.location = location;
        filter.section = section;
    }

    complaintModel.find(filter, function (err, docs) {
        if (err) {
            console.log(err);

        }
        else {
            res.send(docs);
        }


    });
});

//GET  COMPLAINTS to solved
app.get('/admin-to-solve/:location/:section/:duration', function (req, res) {
    var location = req.params.location;
    var section = req.params.section;
    var duration = req.params.duration;
    console.log(location);
    console.log(section);
    var filter = {};
    if (duration == "month") {
        var today = new Date();
        var deadline = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        filter = {
            dateIssued: {
                $gte: new Date(deadline.toISOString()),
                $lt: new Date(today.toISOString())
            }
        }
    }
    else if (duration == "week") {
        var today = new Date();
        var deadline = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        filter = {
            dateIssued: {
                $gte: new Date(deadline.toISOString()),
                $lt: new Date(today.toISOString())
            }
        }
    }
    else if (duration == 'today') {
        var today = new Date();
        var deadline = today.setHours(0, 0, 0, 0);
        var formatDeadline = new Date(deadline);
        filter = {
            dateIssued: {
                $gte: new Date(formatDeadline.toISOString()),
                $lt: new Date(today.toISOString())
            }
        }

    }
    if (location == "All") {
        filter.isSolved = false;
        filter.inProgress = true;
        // filter = { isSolved: false }; 
    }
    else if (section == "All") {
        // filter = { isSolved: false, location: location };
        filter.isSolved = false;
        filter.inProgress = true;
        filter.location = location;

    }
    else {
        // filter = { isSolved: false, location: location, section: section };
        filter.isSolved = false;
        filter.inProgress = true;
        filter.location = location;
        filter.section = section;
    }

    complaintModel.find(filter, function (err, docs) {
        if (err) {
            console.log(err);

        }
        else {
            res.send(docs);
        }


    });
});


//ADMIN PAGE
app.get('/admin-page', function (req, res) {
    res.render('admin');

});
//ADMIN IN PROGRESS PAGE
app.get('/admin-page-progress', function (req, res) {
    res.render('admininprogress');
})




app.listen(3000, function () {
    console.log("Server running on port 3000");
});