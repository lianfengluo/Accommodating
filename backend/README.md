# backend
<img src="https://img.shields.io/badge/python-3.6%2B-blue" alt="python 3.6+"></img> 
<img src="https://img.shields.io/badge/postgresql-9.5%2B-green" alt="postgres 9.5+"></img>

## Configuration and explanation:
Create a `secret.py` file in `Accommodating` before start up your program;
Overall setting is in the `Accommodating/settings.py`\
There are detail in that file;\
The base url routing is configure on `Accommodating/urls.py`;\
More detail comment and explanation of the api will be located in corresponding viewset of those urls.

# Author
Richard Luo (All of the coding and documentation).

# APIs
## User
### Sign up
`1. /api/user/email_verification_not_exists (PUT)`\
`2. /api/user/register (POST)`\
User have to get the email verified first by using the 1st api (this email will be checked whether it's an email is a valid email and own by the user).\
User sign up info will be posted to the 2nd api.

### Login
`1. /api/user/login (POST)`\
Interface for user login

### Logout
`1. /api/user/logout (GET)`\
Login user want to logout to avoid my personal information accessed by other people. (by 1st api).

### Forget password
`1. /api/user/logout (GET)`\
First get the verification code from the registered user email using 1st api.\
Then it will be able to use 2nd api to reset the password.

### Profile
`1. /api/user/update_info/ (PUT)`\
`2. /api/user/update_img/ (PUT)`\
As a login user, I want to have a view of my account information and make some modifications.\
User will be able to update part of their user info on their profile page by posting request to 1st api, or they can update their user image using 2nd api.\

### User page
`1. /user/info/${user_id}/ (GET)`\
`2. /accommodation/info/user/?owner=${user_id} (GET)`\
User can go to other or their user page. In this page, other use can check on the user information (1st api), and on top of that use page they will be able to show all the properties (2nd api) under their name and going to corresponding property page. It also shows the user reviews to this user.

### User review
`1. /user/review/?id=${user_id} (POST)`\
`2. /user/review/overall/?id=${user_id} (GET)`\
`3. /user/review/overall/?id=${user_id}&&offset=${page} (GET)`\
The first api is used to get the total reviews rate and average review rate of the user.\
The second api is used to get the user reviews detail (20 records). \
The third api is used to retrieve the next page user reviews.
<hr/>

## Accommodation
### Accommodation advertise
`1. /accommodation/upload/ (PUT)`\
A registered user would like to post their housing info to the public (1st api) so that other user can find my accommodation and make a booking base on that. The address info will base on the google map api and the most important data that will be used to search later is the geographic data (longitude and latitude)

### Accommodation info
`1. /accommodation/retrieve/${accommodation_id}/ (GET)`\
Every property has its own property page (1st api). User will be able to access a property page by themselves so that they can see all the image, description related to the property, the geographic location and the owner info from here.

### Accommodation update
`1. /accommodation/update/ (PUT)`\
The owner of this property can edit this property on the description, the image, the rule and the price.

### Accommodation delete
`1. /accommodation/delete/?id=${accommodation_id} (GET)`\
`2. /accommodation/delete/?id=${accommodation_id} (DELETE)`\
The owner can use the first api that check on whether the property of them can be deleted (owner are not allowed to delete the booking if someones' booking requests have been accepted). \
Then they can post the delete request to delete the property post (by second api).

### Accommodation booking request
`1. /accommodation/not_available/?accommodation=${accommodation_id} (GET)`\
`2. /accommodation/booking/ (POST)`\
User will not be available to book the date that the accommodation have been booked and accepted, and we can get these date by (1st api), the backend algorithm will query the database and filter out all booking data and retrieve each of the booked (accepted) date back to the user. \
Then the booking request can be post on the second api.


### Accommodation booking info
`1. /accommodation/booking/?id=${booking_id} (GET)`\
User can retrieve the booking detail by calling the 1st api and it will return the info such as total price, start date and end date to the user.

### Accommodation Booking operation
`1. /accommodation/cancel/ (POST)`\
`2. /message/accept/?id=${booking_id} (GET)`\
`3. /message/paid/?id=${booking_id} (GET)`\
User can use the first api to cancel the booking request if it's in the accepted or booking state. And the accepted and paid api (2,3) is to change the booking state after accept by the owner and pay by the user.\
When accept happen we will expired all the overlap booking request which is in booking status of this property.\

### Search accommodation
`1. /accommodation/info/?${query} (GET)`\
User can use this api to search and retrieve or filter out the properties user are not interested in (1st api).\
Parameters in the query:\
1. start\_time=\${start\_time}, end_time=\${end\_time};\
2. latitude=\${latitude}, longitude=\${longitude}\
3. days=\${days}\
4. order=\${order\_by}\
5. offset=\${page - 1}\

The fourth the days is used to do the flexible search. For example, users have a free time slot(holiday break or so) but only want to book some days between this time slot. They can choose a sorts of house in this time slot. \
The fifth argument is used to order the result by such as the price the rate.\
The sixth argument is used to do the pagination (default is the first page)\

### Check accommodation wishes list
`1. /accommodation/wisheslist/?offset=${page - 1} (GET)`\
`2. /accommodation/info/list_by_id/ (POST)`\
User can fetch a collection of the accommodation id that user have liked (1st api). Then they can use the second api to get the accommodation info by these ids.\
The offset is the used for pagination.

### Get accommodation wishes list
`1. /accommodation/wisheslist/${accommodation_id}/ (GET)`\
User can use this api to see whether they have liked this accommodation.

### Set accommodation wishes list
`1. /accommodation/wisheslist/ (POST)`\
User likes the property by this api.

### Delete accommodation wishes list
`1. /accommodation/wisheslist/${accommodation_id}/ (DELETE)`\
User cancels the like to property by this api.

### Post review on accommodation (with user review)
`1. /accommodation/post_review/ (POST)`\
After the user finished the experience of this properties, they can put some rate and feedback to the owner and this accommodation.

### Accommodation review overall
`1. /accommodation/review/?id=${user_id} (POST)`\
`2. /accommodation/review/overall/?id=${user_id} (GET)`\
`3. /accommodation/review/overall/?id=${user_id}&&offset=${page} (GET)`\
The first api is used to get the total reviews rate and average review rate of the accommodation.\
The second api is used to get the accommodation reviews detail (20 records).\\
The third api is used to retrieve the next page accommodation reviews.

### Accommodation recommendation
`1. /accommodation/recommendation/?${query}(GET)`\
This api will return at most 6 elements of recommendation near user (identified by accessing user' location) solve by the popularity.

<hr>

## Message

### Renter message
`1. /message/renter/ (GET)`\
Users can retrieve the message that they are the renter of the corresponding booking.

### Host message
`1. /message/host/ (GET)`\
Users can retrieve the message that they are the host of the corresponding booking.

### Get first message
`1. /message/first/?id=${booking_id} (GET)`\
Users can retrieve the first message of the message dialog.

### View all message of booking
`1. /message/all/?id=${booking_id} (GET)`\
Users can retrieve the all message of the message dialog.

### Post message
`1. /message/post/ (POST)`\
User can post their message by this api.

### Unread message
`1. /message/unread_count/?id=${booking_id} (GET)`\
`2. /message/unread_all/ `\
User can use the first api to retrieve how many messages have not been read in the corresponding booking id. \
The second api is used to retrieve how many unread messages of the login user.

### Read message
`1. /message/read_message/?id=${booking_id} (GET)`\
When the user read the message dialog, they will call this api to set the unread message to 0.
