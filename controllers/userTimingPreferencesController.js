const path = require("path")
const userTimingPreferencesFilePath = path.join(__dirname, '..', 'dataFiles','userTimingPreferencesData.txt')
const util = require("util")
const fs = require("fs")
const userController = require('./userController')


exports.getUserTimingById = async function (req, res) {

    let user_id = req.params.user_id

    if(!user_id) {
        return res.status(412).send("user_id is essential parameter")
    }
    let userTimePrefObj = await userController.readUserDataFile(userTimingPreferencesFilePath)
    let idx = userController.search(userTimePrefObj,"",user_id)
    res.setHeader('Content-Type', 'application/json')

    if(!userTimePrefObj[idx]) {
        return res.status(404).send("User Timing Preference does not exist with user_id: "+user_id)
    }
    return res.status(200).send(userTimePrefObj[idx])
}

exports.updateUserTimingById = async function (req, res) {

    let user_id = req.params.user_id

    if(!user_id) {
        return res.status(412).send("user_id is essential parameter")
    }
    let userTimePrefObj = await userController.readUserDataFile(userTimingPreferencesFilePath)
    let idx = userController.search(userTimePrefObj,"",user_id)
    res.setHeader('Content-Type', 'application/json')

    if(!userTimePrefObj[idx]) {
        return res.status(404).send("User Timing Preference does not exist with user_id: "+user_id)
    }

    let dayStartTime, dayEndTime, timeZone
  
    if(req.body){
        if(req.body.day_start_time){
            dayStartTime = req.body.day_start_time
        } 
        if(req.body.day_end_time){
            dayEndTime = req.body.day_end_time
        }
        if(req.body.timezone){
            timeZone = req.body.timezone
        }
    }

    userTimePrefObj[idx].day_start_time = dayStartTime
    userTimePrefObj[idx].day_end_time = dayEndTime
    userTimePrefObj[idx].timezone = timeZone

    userController.updateUserDataFile(userTimingPreferencesFilePath,userTimePrefObj)   
    return res.status(200).send("User Timing Preference has been updated")
};

exports.deleteUserTimingById = async function (req, res) {
    
    let user_id = req.params.user_id

    if(!user_id) {
        return res.status(412).send("user_id is essential parameter")
    }
    let userTimePrefObj = await userController.readUserDataFile(userTimingPreferencesFilePath)
    let idx = userController.search(userTimePrefObj,"",user_id)
    res.setHeader('Content-Type', 'application/json')

    if(!userTimePrefObj[idx]) {
        return res.status(404).send("User Timing Preference does not exist with user_id: "+user_id)
    }

    userTimePrefObj[idx] = {}
    userController.updateUserDataFile(userTimingPreferencesFilePath, userTimePrefObj)  
    return res.status(200).send("User Timing Preference has been Deleted")
};

