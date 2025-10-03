where did you stored the admin details also I don't see the other key Baki pair in other users date like the one given here below about the admin
and since these are are use them too they are not just for show here, if the key name is something else change accordingly in the json file or this example
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



the most important thing to fix:
images inside posts are still not in center, maybe eithersome other css is overwriting or some other elemnts causing problem but in the posts; the image inside the card isnt showing the center part of the image.

load more button refreshes or changes the posts and takes on top instead of just revealing more posts without changing whats already present above, load more button doesnt look good and isnt in center
show 30 posts by default then show the load more button

view count is updating in the json file but the count on the post doesnt change immediately, it changes upon a refresh, and after adding a comment it automatically refreshes the post page taking on the top

add sort filter and search in profile page too

redesign the liked saved comments entire section, i only liked the way small cards of posts are being displayed.

redesign the counts on profile too