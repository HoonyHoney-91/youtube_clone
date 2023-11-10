# YouTube Clone



This is a full-stack YouTube clone application built with Node.js, Express, MongoDB, and other modern web technologies.

### Features

- User authentication with hashed passwords & sessions
- Login with GitHub OAuth
- Profile management
- Upload videos and images to AWS S3
- Video playback with controls
- Like, view counters, and comments on videos
- Search videos by title and description
<!-- - Responsive UI for desktop and mobile -->

### User Authentication
- Users can sign up, login, and logout
- User passwords are hashed using Bcrypt before storing in MongoDB
- Sessions are used to determine if user is logged in
- Login with GitHub OAuth is supported

### User Profiles
- User profiles display name, location, joined date, avatar image
- Users can update their name, email, password, location, and avatar image
- Avatar images are uploaded to AWS S3

### Video Upload & Playback
- Authenticated users can upload videos up to 10 minutes long
- Upload progress bar displays status
- Videos are encoded using FFmpeg and stored in AWS S3
- Video player features play/pause, volume, fullscreen, and video timeline
- Data attributes assist with video playback actions

### Video Search & Discovery
- Search videos by title and description
- Video view counts displayed
- Pagination for videos
- Click video title to go to video watch page

### Video Comments
- Authenticated users can comment on videos
- Comments are stored in MongoDB
- Users can delete their own comments
- Recent comments are displayed below video

## Built With

### Backend
- Node - JavaScript runtime
- Express - Web application framework
- MongoDB - NoSQL database
- Mongoose - MongoDB ORM
- AWS S3 - File storage

#### Data Modeling with Mongoose
The app defines MongoDB data models using Mongoose schemas and models:

- User - Defines user properties like email, username, avatar, videos etc. Has pre-save hook to hash passwords.
- Video - Defines video properties like title, description, file URL, views etc. Has static method to format hashtags.
- Comment - Stores text, owner and video reference.

The schemas define the structure of documents in MongoDB collections. Some key points:

- Validation for required fields, data types and lengths
- Data relationships using ObjectId refs and population
- Hooks like password hashing before saving
- Static helpers like hashtag formatter
- Defaults for values like date created or view count

    This structure allows interacting with MongoDB in an object oriented way.

    Some examples:

    ```JavaScript
    // Example creating a user
    const user = await User.create({
        email: 'foo@bar.com',
        password: '12345' // hashed before save
    }) 

    // Example querying videos 
    const videos = await Video.find()
        .populate('owner') // populate owner objectId ref  
        .sort({createdAt: 'desc'})
    ```

### Frontend
- JavaScript - Language
- Pug - Template engine
- SASS - CSS preprocessor
- Webpack - Module bundler
- Babel - JS compiler

## Getting Started

Instructions for installing and running project locally.

### Prerequisites
- Node.js and NPM
- MongoDB instance
- AWS S3 account

### Installing
1. Clone the repo<br />
`git clone https://github.com/hoony91/youtube_clone.git`

2. Install NPM packages<br />
`npm install`

3. Set environment variables<br />
`cp .env.example .env`

4. Run the server<br />
`npm run start`

The app will now be running at http://localhost:3000

### Deployment

Add additional notes about how to deploy this on a live system


## Authors
Kanghoon Shin

Let me know if you would like me to modify or expand this README file further. I tried to capture the overall structure, technologies, features, installation, usage, and credits.
