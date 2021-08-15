const express = require('express')
const app = express()
const userController = require('../controllers/userController')
const userTimingPreferencesController =  require('../controllers/userTimingPreferencesController')
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()


app.get('/ping',(req,res)=>{
    res.send('pong')
})

// Routes for USER

// To send all the users in the file
app.get('/allusers',  jsonParser, userController.getAllUsers)
app.get('/user/:user_id', jsonParser, userController.getUserById)
app.post('/adduser', jsonParser, userController.addUser)
app.put('/user/:user_id', jsonParser, userController.updateUser);
app.delete('/user/:user_id', jsonParser, userController.deleteUserById);

// Routes for User Timing Preferences

app.get('/user-timePreference/:user_id', jsonParser, userTimingPreferencesController.getUserTimingById);
app.put('/user-timePreference/:user_id', jsonParser, userTimingPreferencesController.updateUserTimingById);
app.delete('/user-timePreference/:user_id', jsonParser, userTimingPreferencesController.deleteUserTimingById);


// To find suggested free slots for the two users , on duration mins and counter

app.post('/suggested-time', jsonParser, userController.suggestedFreeSlots)

module.exports = app;
