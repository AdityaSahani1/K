for some reason, the password of admin from the json file got removed automatically and is giving errors

i noticed that for otp or reset link a new file is being created, will that be deleted automatically when used or expired
if not don't create another file instead store them in user json that easy we won't use much space 

if storing in the json file store like this for all users
[
  {
    "id": "admin",
    "username": "admin",
    "email": "admin@portfolio.com",
    "password": "$2y$12$Nnt3V31pezhFQ1NB/RqF.uwHMMLmcSdGw6X7hMLmyAoPAKA7k4Jm2",
    "role": "admin",
    "created": "2024-01-01T00:00:00Z",
    "bio": "Portfolio administrator and creative director",
    "isVerified": true,
    "emailVerificationToken": null,
    "otpToken": null,
    "otpExpires": null,
    "otpCreated": null,
    "passwordResetToken": null,
    "passwordResetExpires": null,
    "lastLogin": null,
    "loginAttempts": 0,
    "accountLocked": false,
    "lockExpires": null
  }
]





the email is working but the details are messed up, like in contact form 
the email got sent and received both by the set credentials meaning the admin, the contact mail wasn't even in the senders(users mail) how will he see what he sent 
I want that contact form contain the retail of who sent the form
i know there's a parameter in context form for email but what if the user wrote wrong mail in the form, shouldn't the email has logged in with be used too


redesign the liked saved comments in profile completely from scratch 

registration is failing it's says user not found or registration failed

email notification of contact page is too long

reset all stat data back to zero of the post

in the search popup model the heading and cross button are overlapping

the post popup model on small screen isn't good, the image is covering half of the screen and other things aren't completly visible

in comment section after adding a comment it is visible but there is no gap at the bottom

add ten more post in post.json file

and finally recheck everthing about authentication and email being sent properly