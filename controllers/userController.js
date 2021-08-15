const path = require("path")
const userDataFilePath = path.join(__dirname, '..', 'dataFiles','userData.txt')
const util = require("util")
const fs = require("fs")
const userController = require('./userController')
const { listeners } = require("cluster")
const userTimingPreferencesFilePath = path.join(__dirname, '..', 'dataFiles','userTimingPreferencesData.txt')


exports.readUserDataFile = async function(filePath) {
    const promises = require('fs').promises;
    try {
        const data = await promises.readFile(filePath,'utf8'); 
        return JSON.parse(data)
    } catch (error) {
        return error
    }
}

exports.updateUserDataFile = function (filePath,data){

    fs.writeFile(filePath, JSON.stringify(data), function(err){
        if(err){
            util.log(err);
            return;
        }
        util.log("File is updated");
    });
}

exports.search = function (myArray,emailKey,user_id){
    for (let i=0; i < myArray.length; i++) {
        if (emailKey!= "" && myArray[i].email === emailKey) {
            return true
        } else if (user_id!=0 && myArray[i].user_id == user_id){
            return i
        }
    }
}

exports.getAllUsers = async function (req, res) {

    let userDataObj = await userController.readUserDataFile(userDataFilePath)
    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(userDataObj)
}

exports.getUserById = async function (req, res) {

    let user_id = req.params.user_id
    if(!user_id) {
        return res.status(412).send("user_id is essential parameter")
    }
    let userDataObj = await userController.readUserDataFile(userDataFilePath)
    let idx = userController.search(userDataObj,"",user_id)
    res.setHeader('Content-Type', 'application/json')

    if(!userDataObj[idx]) {
        return res.status(404).send("User does not exist with user_id: "+user_id)
    }
    return res.status(200).send(userDataObj[idx])
};

exports.addUser = async function(req, res) {
    
    let body = req.body
    let userDataObj = await userController.readUserDataFile(userDataFilePath)
    let totalIds = userDataObj.length
    res.setHeader('Content-Type', 'application/json')

    if (!body.email){
        return res.status(412).send("Please enter email")
    }
    isEmail = userController.search(userDataObj,body.email,0)

    if (isEmail) {
        return res.status(422).send("Email Id exists")
    }
    // Unprocessable Entity
    if (body.name.length < 1 || body.company_name.length < 1) {
        return res.status(422).send("Please enter name/company_name")
    }

    const newUser = {
        "user_id":totalIds+1,
        "name": body.name,
        "company_name": body.company_name,
        "email": body.email
    }

    userDataObj.push(newUser)
    userController.updateUserDataFile(userDataFilePath,userDataObj)
    return res.status(200).send({"user_id":newUser.user_id})
}

exports.updateUser = async function (req, res) {
    
    let user_id = req.params.user_id

    if(!user_id) {
       return res.status(412).send("user_id is necessary to update the user")
    }
    let userDataObj = await userController.readUserDataFile(userDataFilePath)
    let idx = userController.search(userDataObj,"",user_id)
    res.setHeader('Content-Type', 'application/json')

    if(!userDataObj[idx]) {
        return res.status(404).send("User does not exist with user_id: "+user_id)
    }
    let name, email, company_name

    if(req.body){
        if(req.body.name){
            name = req.body.name
        }
        if(req.body.email){
            email = req.body.email
        }
        if(req.body.company_name){
            company_name = req.body.company_name
        }
    }

    if(!email){
        email = userDataObj[idx].email
    } 

    userDataObj[idx].name = name
    userDataObj[idx].email = email
    userDataObj[idx].company_name = company_name
    userController.updateUserDataFile(userDataFilePath,userDataObj)
    
    return res.status(200).send("User has been updated")
};

exports.deleteUserById = async function (req, res) {
   
    let user_id = req.params.user_id

    if(!user_id) {
       return res.status(412).send("user_id is necessary to remove the user")
    }
    let userDataObj = await userController.readUserDataFile(userDataFilePath)
    let idx =  userController.search(userDataObj,"",user_id)

    if(!userDataObj[idx]) {
        return res.status(404).send("User does not exist with user_id: "+user_id)
    }
    res.setHeader('Content-Type', 'application/json')
    userDataObj[idx] = {}
    userController.updateUserDataFile(userDataFilePath,userDataObj)

    return res.status(200).send("User has been deleted")
};

function convertToIndex(timeStr){

    var date = new Date(timeStr)
    let hr = parseInt(date.getHours())
    let min = parseInt(date.getMinutes())

    return hr*60+min
} 

function convertMinsToHrs (mins) {
   
    let h = Math.floor(mins / 60)
    let m = mins % 60
    h = h < 10 ? '0' + h : h
    m = m < 10 ? '0' + m : m

    return `${h}:${m}`
}

function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

exports.suggestedFreeSlots = async function(req,res) {
    
    let users = req.query.users.split(",")
    if(users.length < 2) {
        return res.status(412).send("Please enter Users")
    }
    let userId1,userId2
    if(users.length > 1){
        userId1 = users[0]
        userId2 = users[1]
    }
    let durationMins = req.query['duration_mins']
    let noOfSlots = req.query['count']

    if(!noOfSlots){
        noOfSlots = 1
    }

    if(req.body) {

        if(!req.body.userId1){
            return res.status(412).send("User 1 calendars missing")
        }

        if(!req.body.userId2){
            return res.status(412).send("User 2 calendars missing")
        }
        let userId1Obj = req.body.userId1
        let userId2Obj = req.body.userId2
        let busySlots1 = [],busySlots2 = []

        if(userId1Obj.calendars.primary.busy){
            busySlots1 = userId1Obj.calendars.primary.busy
        } else {
            return res.status(412).send("User 1 time slot missing")
        }

        if(userId2Obj.calendars.primary.busy){
            busySlots2 = userId2Obj.calendars.primary.busy
        } else {
            return res.status(412).send("User 2 time slot missing")
        }

        let userTimePrefObj = await userController.readUserDataFile(userTimingPreferencesFilePath)
        let idx1 = userController.search(userTimePrefObj,"",userId1)

        if(!userTimePrefObj[idx1]) {
            return res.status(404).send("User 1 Time Preference does not exists user_id: ",userId1)
        }

        let idx2 = userController.search(userTimePrefObj,"",userId2)

        if(!userTimePrefObj[idx2]) {
            return res.status(404).send("User 2 Time Preference does not exists user_id: ",userId2)
        }

        user_1Obj = userTimePrefObj[idx1]
        user_2Obj = userTimePrefObj[idx2]
        let startTime, endTime

        if(user_1Obj.day_start_time >= user_2Obj.day_start_time) {
            startTime = user_1Obj.day_start_time
        } else {
            startTime = user_2Obj.day_start_time
        }

        if(user_1Obj.day_end_time >= user_2Obj.day_end_time) {
            endTime = user_2Obj.day_end_time
        } else {
            endTime = user_1Obj.day_end_time
        }
        
        let bookedSlotTime = []
        bookedSlotTime.length = 24*60

        for(let i=0;i<24*60;i++){
            bookedSlotTime[i] = false
        }

        let userDate1 ,userDate2,dateObj

        if(busySlots1.length == 0 || busySlots2.length == 0 ){
            res.status(412).send("Enter busy slots")
        }

        userDate1 = new Date(busySlots1[0].start)
        dateObj = userDate1
        userDate1 = userDate1.getDate()
        let status = true

        busySlots1.forEach(function(item){
            
            let tuserDate1 = new Date(item.start)
            tuserDate1 = convertTZ(tuserDate1, "Asia/Kolkata")
            let s = convertToIndex(tuserDate1)
            tuserDate1 = tuserDate1.getDate()

            let tuserDate2 = new Date(item.end)
            tuserDate2 = convertTZ(tuserDate2, "Asia/Kolkata")
            let e = convertToIndex(tuserDate2)
            tuserDate2 = tuserDate2.getDate()
            
            if(userDate1 != tuserDate1 || userDate1 != tuserDate2){
                status = false
                return;
            }
            for(let i=s;i<e;i++) {
                bookedSlotTime[i] = true
            }
        })

        if(!status){
            return res.status(400).send("This Api works for same date, not for different date")
        }
        userDate3 = new Date(busySlots1[0].start)
        userDate3 = userDate3.getDate()

        busySlots2.forEach(function(item){
            
            let tuserDate3 = new Date(item.start)
            tuserDate3 = convertTZ(tuserDate3, "Asia/Kolkata")
            let s = convertToIndex(tuserDate3)
            tuserDate3 = tuserDate3.getDate()

            let tuserDate4 = new Date(item.end)
            tuserDate4 = convertTZ(tuserDate4, "Asia/Kolkata")
            let e = convertToIndex(tuserDate4)
            tuserDate4 = tuserDate4.getDate()

            if(userDate3 != tuserDate3 || userDate3 != tuserDate4){
                status = false
                return;
            }
            for(let i=s;i<e;i++){
                bookedSlotTime[i] = true
            }
        })

        if(!status){
            return res.status(400).send("This Api works for same date, not for different date")
        }

        let ans = []
        startTime = startTime.split(":")
        endTime = endTime.split(":")
       
        wHourStartIdx = parseInt(startTime[0])*60 + parseInt(startTime[1])
        wHourEndIdx = parseInt(endTime[0])*60 + parseInt(endTime[1])
        durationMins = parseInt(durationMins)
        noOfSlots = parseInt(noOfSlots)

        for(let i=wHourStartIdx;i<=wHourEndIdx-durationMins;i++){
            let j=i,not_ava=false
            for(;j<i+durationMins && j<=wHourEndIdx;j++){

                if(bookedSlotTime[j]){
                    not_ava = true;
                    break;
                } else {
                    bookedSlotTime[j] = true
                }
            }
            if(!not_ava) {
                ans.push(i)
                i = i + durationMins - 1
                noOfSlots = noOfSlots - 1
            }
            if(noOfSlots==0){
                break;
            }
        }

        if(noOfSlots) {
            return res.status(200).send("Requested No of slots not available")
        }
        // making Final Slot
        let finalSlot = []
        for(const val of ans){
            let st = convertMinsToHrs(val)
            let et = convertMinsToHrs(val+durationMins)

            console.log(st," ",et)
            let newslot = {
                "start":st,
                "end": et
            }
            finalSlot.push(newslot)
        }
        return res.status(200).send({"Date":dateObj.toDateString() , "Slots" : finalSlot})
    }
    return res.status(412).send("Request cannot be proceed")
}

     