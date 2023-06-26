var express = require("express");
const db = require("../dbhelper");
var app = express();
const val = require('./constant');
const bodyParser = require('body-parser');
const cors = require('cors')
const AWS = require('aws-sdk');
const fs = require("fs");
const path = require("path");
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));



// Configure AWS credentials and region
AWS.config.update({
    accessKeyId: val.accessKeyId,
    secretAccessKey: val.secretAccessKey,
    region: val.region
});

// Create S3 client
const s3 = new AWS.S3();



// Example: Upload a file to S3
const uploadFile = (fileName, fileData) => {
    const filePath = path.join(__dirname, 'temple.jpg');
    const params = {
        Bucket: 'cip-engage',
        Key: 'company-LOGO',
        Body: filePath
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error(err);
            // Handle error
        } else {
            // File uploaded successfully
            console.log("uploaded data")
            console.log(data);
            // Process the upload response
        }
    });
};

// Example: Download a file from S3
const downloadFile = (fileName) => {
    const params = {
        Bucket: 'cip-engage',
        Key: 'company-LOGO'
    };

    s3.getObject(params, (err, data) => {
        if (err) {
            console.error(err);
            // Handle error
        } else {
            // File downloaded successfully
            console.log(data);
            // Process the file data
        }
    });


}










app.post('/companyDetail', async (req, res) => {
    try {
        SP_ID = req.body.SP_ID
        profile_img = req.body.profile_img
        Company_Name = req.body.Company_Name
        Company_Website = req.body.Company_Website
        Country = req.body.Country
        Phone_Number = req.body.Phone_Number
        Industry = req.body.Industry
        Employees_count = req.body.Employees_count
        created_By = req.body.created_By
        created_at = new Date();

        var select = await db.excuteQuery(val.selectCompanyDetails, [SP_ID])
        console.log(select.length != 0)
        if (select.length != 0) {

            var UpComValues = [req.body.profile_img, req.body.Company_Name, req.body.Company_Website, req.body.Country, req.body.Phone_Number, req.body.Industry, req.body.Employees_count, req.body.created_By, created_at, req.body.SP_ID]
            var updatedcompanyData = await db.excuteQuery(val.updateCompanyDetails, UpComValues)

            res.status(200).send({
                msg: 'companyData updated successfully !',
                updatedcompanyData: updatedcompanyData,
                status: 200
            });

        } else {
            var InComValues = [req.body.SP_ID, req.body.profile_img, req.body.Company_Name, req.body.Company_Website, req.body.Country, req.body.Phone_Number, req.body.Industry, req.body.Employees_count, req.body.created_By, created_at]
            var companyData = await db.excuteQuery(val.insertCompanyDetails, [[InComValues]])

            res.status(200).send({
                msg: 'companyData added successfully !',
                companyData: companyData,
                status: 200
            });

        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

})

app.post('/localDetails', async (req, res) => {
    try {
        SP_ID = req.body.SP_ID
        Date_Format = req.body.Date_Format
        Time_Format = req.body.Time_Format
        Time_Zone = req.body.Time_Zone
        Currency = req.body.Currency
        created_By = req.body.created_By
        const created_at = new Date();

        var localdatabyspid = await db.excuteQuery(val.selectlocalDetails, [SP_ID])
        console.log(localdatabyspid.length != 0)
        if (localdatabyspid.length != 0) {
            var UplocalVal = [Date_Format, Time_Format, Time_Zone, Currency, created_By, created_at, SP_ID]
            var UplocalData = await db.excuteQuery(val.updatelocalDetails, UplocalVal)
            res.status(200).send({
                msg: 'localDetails updated successfully !',
                UplocalData: UplocalData,
                status: 200
            });
        } else {
            var InlocalVal = [[SP_ID, Date_Format, Time_Format, Time_Zone, Currency, created_By, created_at]]
            var InlocalData = await db.excuteQuery(val.insertlocalDetails, [InlocalVal])
            res.status(200).send({
                msg: 'localDetails added successfully !',
                InlocalData: InlocalData,
                status: 200
            });
        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})

app.post('/billingDetails', async (req, res) => {
    try {
        SP_ID = req.body.SP_ID
        InvoiceId = req.body.InvoiceId
        billing_email = req.body.billing_email
        Address1 = req.body.Address1
        zip_code = req.body.zip_code
        created_By = req.body.created_By
        Address2 = req.body.Address2
        Country = req.body.Country
        City = req.body.City
        State = req.body.State

        const created_at = new Date();

        var billingDATAbyspid = await db.excuteQuery(val.selectBillingDetails, [SP_ID])
        console.log(billingDATAbyspid.length != 0)
        if (billingDATAbyspid.length != 0) {
            var UpbillingVal = [InvoiceId, billing_email, Address1, zip_code, created_By, Address2, created_at, Country, City, State, SP_ID]
            var UpbillingData = await db.excuteQuery(val.updateBillingDetails, UpbillingVal);
            res.status(200).send({
                msg: 'billingDetails updated successfully !',
                UpbillingData: UpbillingData,
                status: 200
            });
        } else {
            var InbillingVal = [[SP_ID, InvoiceId, billing_email, Address1, zip_code, created_By, Address2, created_at, Country, City, State]]
            var InbillingData = await db.excuteQuery(val.insertBillingDetails, [InbillingVal]);
            res.status(200).send({
                msg: 'billingDetails added successfully !',
                InbillingData: InbillingData,
                status: 200
            });
        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

})


app.post('/updateCompanyDetail', async (req, res) => {
    try {
        SP_ID = req.body.SP_ID
        profile_img = req.body.profile_img
        Company_Name = req.body.Company_Name
        Company_Website = req.body.Company_Website
        Country = req.body.Country
        Phone_Number = req.body.Phone_Number
        Industry = req.body.Industry
        Employees_count = req.body.Employees_count
        created_By = req.body.created_By
        updated_at = Date.now()
        var ComValues = [req.body.profile_img, req.body.Company_Name, req.body.Company_Website, req.body.Country, req.body.Phone_Number, req.body.Industry, req.body.Employees_count, req.body.created_By, req.body.updated_at, req.body.SP_ID]
        var updatedcompanyData = await db.excuteQuery(val.updateCompanyDetails, ComValues)

        res.status(200).send({
            msg: 'companyData updated successfully !',
            updatedcompanyData: updatedcompanyData,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

})

app.post('/updateLocalDetails', async (req, res) => {
    try {
        SP_ID = req.body.SP_ID
        Date_Format = req.body.Date_Format
        Time_Format = req.body.Time_Format
        Time_Zone = req.body.Time_Zone
        Currency = req.body.Currency
        created_By = req.body.created_By
        const updated_at = new Date();
        var localVal = [Date_Format, Time_Format, Time_Zone, Currency, created_By, updated_at, SP_ID]
        var localData = await db.excuteQuery(val.updatelocalDetails, localVal)
        res.status(200).send({
            msg: 'localDetails updated successfully !',
            localData: localData,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})

app.post('/updatebillingDetails', async (req, res) => {
    try {
        SP_ID = req.body.SP_ID
        InvoiceId = req.body.InvoiceId
        billing_email = req.body.billing_email
        Address1 = req.body.Address1
        zip_code = req.body.zip_code
        created_By = req.body.created_By
        Address2 = req.body.Address2
        Country = req.body.Country
        City = req.body.City
        State = req.body.State

        const updated_at = new Date();
        var billingVal = [InvoiceId, billing_email, Address1, zip_code, created_By, Address2, updated_at, Country, City, State, SP_ID]
        var billingData = await db.excuteQuery(val.updateBillingDetails, billingVal);
        res.status(200).send({
            msg: 'billingDetails updated successfully !',
            billingData: billingData,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

})

app.get('/companyDetail/:spID', async (req, res) => {
    try {
        var resbyspid = await db.excuteQuery(val.selectCompanyDetails, [req.params.spID])
        console.log("comapany")
        res.status(200).send({
            msg: 'companyDetail got successfully !',
            companyDetail: resbyspid,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})

app.get('/localDetails/:spID', async (req, res) => {
    try {
        var localbyspid = await db.excuteQuery(val.selectlocalDetails, [req.params.spID])

        res.status(200).send({
            msg: 'localDetails got successfully !',
            localDetails: localbyspid,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})


app.get('/billingDetails/:spID', async (req, res) => {
    try {
        var billingbyspid = await db.excuteQuery(val.selectBillingDetails, [req.params.spID])

        res.status(200).send({
            msg: 'billingDetails got successfully !',
            billingDetails: billingbyspid,
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})






app.post('/uploadlogo', (req, res) => {
    try {
        // uploadFile(filePath, bucketName, newFileNameKey)

        res.status(200).send({
            msg: 'img added successfully !',
            status: 200
        });
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

})



//_______________WORKING HOURS_________________________//
app.post('/workingDetails', async (req, res) => {
    try {
        var created_at = new Date();
        var data = req.body.days
        var isDeleted=1;
       var deleteWork=await db.excuteQuery(val.deleteWork,[isDeleted,created_at,req.body.SP_ID])
       console.log("deleteWork " + deleteWork)
        data.forEach(async (item) => {

            const values = [req.body.SP_ID, item.day, item.startTime, item.endTime, created_at, req.body.created_By];


            var workResult = await db.excuteQuery(val.insertWork, values)
            console.log(workResult)
        })
        res.status(200).send({
            msg: 'workingDetails added successfully !',
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})

app.get('/workingDetails/:spID', async (req, res) => {
    try {
        var result = await db.excuteQuery(val.selectWork, [req.params.spID]);
        res.status(200).send({
            msg: 'workingDetails got successfully !',
            result: result,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})


app.post('/updateWorkingHours', (req, res) => {

    try {
        const updated_at = new Date();
        var data = req.body.days
        data.forEach(async (item) => {

            const values = [item.day, item.startTime, item.endTime, updated_at, req.body.created_By, req.body.SP_ID, item.id];


            var workResult = await db.excuteQuery(val.updateWork, values)
            console.log(workResult)
        })
        res.status(200).send({
            msg: 'workingDetails updated successfully !',
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})




app.post('/holidays', async (req, res) => {

    try {

        SP_ID = req.body.SP_ID
        holiday_date = req.body.holiday_date
        created_By = req.body.created_By
        const created_at = new Date();




        const holidayValue = holiday_date.map(date => [SP_ID, date, created_By, created_at]);

        var holidayResult = await db.excuteQuery(val.insertHoliday, [holidayValue])
        res.status(200).send({
            msg: 'holidays added successfully !',
            holidayResult: holidayResult,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

})

app.get('/holidays/:spID', async (req, res) => {
    try {

        var HolidayList = await db.excuteQuery(val.selectHoliday, [req.body.dateFrom, req.body.dateTo, req.params.spID])

        res.status(200).send({
            msg: 'HolidayList got successfully !',
            HolidayList: HolidayList,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})


app.post('/removeHolidays', async (req, res) => {
    try {
        SP_ID = req.body.SP_ID
        holiday_date = req.body.holiday_date
        const updated_at = new Date();

        const holidayValue = holiday_date.map(date => [SP_ID, date, updated_at]);
        console.log(holidayValue)

        holidayValue.forEach(async row => {
            const spId = row[0];
            const holidayDate = row[1];
            const updatedAt = row[2];

            var holidayRemoved = await db.excuteQuery(val.removeHoliday, [updatedAt, spId, holidayDate])
            console.log(holidayRemoved)
        })
        res.status(200).send({
            msg: 'HolidayList removed successfully !',
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})

//__________________________Roles API's________________________________//

app.get('/subrights/:rightsID', async (req, res) => {
    try {

        var subRightRes = await db.excuteQuery(val.getSubRight, [req.params.rightsID]);
        res.status(200).send({
            msg: 'Get subrights successfully !',
            subRightRes: subRightRes,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

})

app.get('/rights', async (req, res) => {
    try {

        var Rights = await db.excuteQuery(val.getRights, []);
        res.status(200).send({
            msg: 'Get Rights successfully !',
            Rights: Rights,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

})



app.post('/addRole', async (req, res) => {
    try {
        const roleID = req.body.roleID
        RoleName = req.body.RoleName
        Privileges = req.body.Privileges
        IsActive = 1
        subPrivileges = req.body.subPrivileges
        SP_ID = req.body.SP_ID
        const created_at = new Date();
        if (roleID == 0) {

            var addRoleValues = [[RoleName, Privileges, IsActive, subPrivileges, created_at, SP_ID]]
            var rolesRes = await db.excuteQuery(val.addRoleQuery, [addRoleValues])
            res.status(200).send({
                msg: 'Roles added successfully',
                rolesRes: rolesRes,
                status: 200
            })
        }
        else {

            var updateRoleVal = [RoleName, Privileges, IsActive, subPrivileges, created_at, roleID, SP_ID]
            var updateRoleData = await db.excuteQuery(val.updateRole, updateRoleVal)
            res.status(200).send({
                msg: 'Roles Updated successfully',
                updateRole: updateRoleData,
                status: 200
            })
        }
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})

app.get('/getRoles/:roleID/:spid', async (req, res) => {
    try {
        var getRoles = await db.excuteQuery(val.getRoleQuery, [req.params.roleID, req.params.spid])
        res.status(200).send({
            msg: 'Get roles list',
            getRoles: getRoles,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})

app.get('/getUser/:spid/:userType', async (req, res) => {
    try {
        var getUser = await db.excuteQuery(val.getUserQuery, [req.params.spid, req.params.userType])
        res.status(200).send({
            msg: 'Get user list by role',
            getUser: getUser,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})

app.post('/deleteRole/:roleID/:spid', async (req, res) => {
    try {
        var deletedData = await db.excuteQuery(val.deleteQuery, [req.params.roleID, req.params.spid])
        res.status(200).send({
            msg: 'Deleted Successfully',
            deletedData: deletedData,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})



//_______________________ User API __________________________________//

//common method for send email through node mailer
let transporter = nodemailer.createTransport({
    // service: 'SMTP',
    host: val.emailHost,
    port: val.port,
    secure: false,
    auth: {
        user: val.email,
        pass: val.appPassword
    },
    port: val.port,
    host: val.emailHost
});

app.post('/addUser', async (req, res) => {
    try {
        SP_ID = req.body.SP_ID
        email_id = req.body.email_id
        name = req.body.name
        mobile_number = req.body.mobile_number

        const CreatedDate = new Date()
        ParentId = req.body.uid
        UserType = req.body.UserType
        IsDeleted = 0
        IsActive = 1

        var credentials = await db.excuteQuery(val.findEmail, [req.body.email_id])
        if (credentials.length > 0) {
            res.status(409).send({
                msg: 'User Already Exist with this email !',
                status: 409
            });
        } else {
            var randomstring = Math.random().toString(36).slice(-8);
            console.log(randomstring)
            const hash = await bcrypt.hash(randomstring, 10);
            var values = [[SP_ID, email_id, name, mobile_number, hash, CreatedDate, ParentId, UserType, IsDeleted, IsActive]]

            var User = await db.excuteQuery(val.insertQuery, [values]);

            var getData = await db.excuteQuery(val.selectByIdQuery, [User.insertId])

            var mailOptions = {
                from: val.email,
                to: req.body.email_id,
                subject: "user details",
                html: "<h3>User account details is </h3>" + "<h1 style='font-weight:bold;'>  Password = " + JSON.stringify(randomstring) + "</h1>" + " And Details = " + JSON.stringify(getData)

            };

            transporter.sendMail(mailOptions, (error, info) => {


            });
            res.status(200).send({
                msg: "user details has been sent",

                status: 200
            });
        }

    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})

app.get('/rolesList/:spid', async (req, res) => {
    try {
        var getRoles = await db.excuteQuery(val.getRole, [req.params.spid])
        res.status(200).send({
            msg: 'Get roles list',
            getRoles: getRoles,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})


app.post('/deleteUser', async (req, res) => {
    try {
        uid = req.body.uid
        var deleteUser = await db.excuteQuery(val.userdeletQuery, [uid])
        res.status(200).send({
            msg: 'Deleted Successfully',
            deleteUser: deleteUser,
            status: 200
        })

    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})

app.post('/editUser', async (req, res) => {
    try {
        uid = req.body.uid

        email_id = req.body.email_id
        name = req.body.name
        mobile_number = req.body.mobile_number

        const LastModifiedDate = new Date()

        UserType = req.body.UserType

        var editUserData = await db.excuteQuery(val.updateQuery, [email_id, name, mobile_number, LastModifiedDate, UserType, uid])
        res.status(200).send({
            msg: 'User Updated successfully !',
            editUserData: editUserData,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

})


app.get('/getUser/:spid', async (req, res) => {
    try {
        var getUser = await db.excuteQuery(val.selectAllQuery, [req.params.spid])
        res.status(200).send({
            msg: 'Get user list ',
            getUser: getUser,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})



app.post('/addTeam', async (req, res) => {
    try {

        SP_ID = req.body.SP_ID
        team_name = req.body.team_name
        userIDs = req.body.userIDs
        // created_By = req.body.created_By
        created_at = new Date();
        var teamVal = [[SP_ID, team_name, created_at]]
        var teamRes = await db.excuteQuery(val.addteamQuery, [teamVal])
        console.log(teamRes.insertId)

        const allTeamsUser = userIDs.map(data => [teamRes.insertId, data, created_at]);
        console.log(allTeamsUser)


        var teamMapRes = await db.excuteQuery(val.addUserTeamMap, [allTeamsUser])
        console.log(teamMapRes)



        res.status(200).send({
            msg: 'team added successfully',
            teamMapRes: teamMapRes,
            status: 200

        })

    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})


app.post('/deleteTeam', async (req, res) => {
    try {
        id = req.body.id;
        SP_ID = req.body.SP_ID;
        isDeleted = 1;
        isDeletedOn = new Date();
        var mapDel = await db.excuteQuery(val.mapteamDelete, [isDeleted, id])
        console.log("mapDel")
        console.log(mapDel)
        var teamDel = await db.excuteQuery(val.teamDelete, [isDeleted, isDeletedOn, id, SP_ID])
        console.log(teamDel)
        res.status(200).send({
            msg: 'Deleted',
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})

app.post('/editTeam', async (req, res) => {
    try {
        id = req.body.id,
            SP_ID = req.body.SP_ID
        team_name = req.body.team_name
        userIDs = req.body.userIDs
        updated_at = new Date();
        isDeleted = 1;
        var updateTeamdata = await db.excuteQuery(val.updateTeams, [SP_ID, team_name, updated_at, id])
        console.log("updateTeam")
        console.log(updateTeamdata)

        var deleteOldMapTeam = await db.excuteQuery(val.mapteamDelete, [isDeleted, id])
        console.log("deleteOldMapTeam")
        console.log(deleteOldMapTeam)


        const addNewTeamMapVal = userIDs.map(data => [id, data, updated_at]);


        var addNewTeamMap = await db.excuteQuery(val.addUserTeamMap, [addNewTeamMapVal])
        console.log("addNewTeamMap")
        console.log(addNewTeamMap)

        res.status(200).send({
            msg: 'Updated teams',
            status: 200
        })


    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }
})


app.get('/teamsList/:spid', async (req, res) => {
    try {
        var listofteams = await db.excuteQuery(val.selectTeams, [req.params.spid])
        res.status(200).send({
            msg: 'teams list',
            listofteams: listofteams,
            status: 200
        })
    } catch (err) {
        console.log(err)
        db.errlog(err);
        res.send(err)
    }

})



app.listen(3004, function () {
    console.log("Node is running");

});