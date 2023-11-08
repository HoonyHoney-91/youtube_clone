import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: "us-west-1", 
    // region error solve
    //region은 aws->s3->bucket 에 적혀있음
    credentials: {
    // apiVersion: "2023-11-05",
    //날짜는 aws->IAM->user->user click 시 생성날짜 존재
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
    },
});
console.log(process.env.NODE_ENV);

const s3ImageUploader = multerS3({
    s3: s3,
    bucket: "youtubecloneanthony",
    acl: "public-read",
    key: function (req, file, cb) {
        cb(null, "images/" + file.originalname);
    },
});

const s3VideoUploader = multerS3({
    s3: s3,
    bucket: "youtubecloneanthony",
    acl: "public-read",
    key: function (req, file, cb) {
        cb(null, "videos/" + file.originalname);
    },
});

export const localsMiddleware = (req, res, next)=>{
    res.locals.loggedIn=Boolean(req.session.loggedIn);
    res.locals.siteName="Youtube";
    res.locals.loggedInUser= req.session.user || {};
    next();
};

export const protectorMiddleware=(req, res, next)=>{
    if(req.session.loggedIn){
        next()
    }else{
        req.flash("error", "Log in first.");
        return res.redirect("/login")
    }
};
export const publicOnlyMiddleware=(req, res, next)=>{
    if(!req.session.loggedIn){
        next()
    }else{
        req.flash("error", "Not authorized");
        return res.redirect("/")
    }
};

export const avatarUpload = multer({ 
    dest: "uploads/avatars/",
     limits:{
        fileSize: 3000000,
    },
    storage: s3ImageUploader,
});
export const videoUpload = multer({ 
    dest: "uploads/videos/", 
    limits:{
        fileSize: 1000000000,
    },
    storage: s3VideoUploader,
});