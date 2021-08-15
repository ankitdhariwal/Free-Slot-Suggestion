Users - fields 
{
    "user_id":"1",
    "name":"Ankit Dhariwal",
    "company_name":"dive",
    "email" :"ankit.dhariwal@dive.com"
}

UserTimingPreferences - fields  (all the timings are mapped with user_id)
{   
    "user_id":"1",
    "day_start_time":"2022-06-04T08:00:00+05:30",
    "day_end_time":"2022-06-04T09:00:00+05:30",
    "timezone":"India/New Delhi"
}


::: POINTS THAT ARE DECIDED ::::::

==> Only for the single / same date , free slot (suggestion time API) will work.
==> Time Zone in input free slot (suggestion time API) may be different , but response will 
    be return in "timezone": "Asia/Kolkata" , that is the standard kept (response may diff).
    
==> All the user information stored in dataFiles/userData.txt
==> All the user Timing Preference are stored in dataFiles/userTimingPreferencesData.txt.



::: TO RUN THE CODE ::::::

node server.js
postman collection shared link - https://www.postman.com/collections/34e6e64ed3a88660774e


::: APIs Used :::: PORT-3000

1) http://localhost:3000/allusers (GET)

=> To get all the user in dataFile/userData.txt 

2) http://localhost:3000/user/1 (GET)

=> To get the user by its id.

3) http://localhost:3000/adduser (POST)

=> To add user into system , return the new user_id

body 
{
    "name":"Sanchit Dhariwal",
    "company_name":"Wingify",
    "email":"sanchit.dhariwal@wingify.com"
}

4) http://localhost:3000/user/5 (PUT)

=> To update the userData.txt, return with a msg User has been updated.

if email, is not provided , the previous mail is updated, because it unique parameter
body
{
    "name":"Sanchit Dhariwal",
    "company_name":"sharechat"
}

5) http://localhost:3000/user/5 (DEL)

=> To delete the user from userData.txt, with params user_id, return with a msg User has been deleted.

6)  http://localhost:3000/user-timePreference/2 (GET)

=> Will get the user timing Preference, with given user_id.

7)  http://localhost:3000/user-timePreference/2 (PUT)

=> Will update the user timing Preference, with given user_id.
body 
{
    "day_start_time":"08:00",
    "day_end_time":"18:00",
    "timezone":"New Delhi"
}

8)  http://localhost:3000/user-timePreference/2 (DEL)

=> Will delete the user timing Preference, with given user_id.

9) http://localhost:3000/suggested-time/?users=1,2&duration_mins=30&count=4

=> Will give the free slot based on the basics users , duration , count.

body 
{
   "userId1":{
      "calendars":{
         "primary":{
            "busy":[
               {
                "start":"2022-06-04T10:00:00+05:30",
                "end":"2022-06-04T12:00:00+05:30"
               },
               {
                "start":"2022-06-04T14:00:00+05:30",
                "end":"2022-06-04T15:00:00+05:30"
               },
                {
                "start":"2022-06-04T17:00:00+05:30",
                "end":"2022-06-04T18:00:00+05:30"
               }
            ]
         }
      }
   },
   "userId2":{
      "calendars":{
         "primary":{
            "busy":[
               {
                "start":"2022-06-04T12:30:00+05:30",
                "end":"2022-06-04T13:00:00+05:30"
               },
               {
                "start":"2022-06-04T15:00:00+05:30",
                "end":"2022-06-04T16:30:00+05:30"
               }
            ]
         }
      }
   }
}


res => There are some changes in response ,that are dependent on framework.

{
    "Date": "Sat Jun 04 2022",
    "Slots": [
        {
            "start": "12:00",
            "end": "12:30"
        },
        {
            "start": "13:00",
            "end": "13:30"
        },
        {
            "start": "13:30",
            "end": "14:00"
        },
        {
            "start": "16:30",
            "end": "17:00"
        }
    ]
}

