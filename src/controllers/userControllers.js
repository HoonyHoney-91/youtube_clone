import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import { render } from "pug";

export const getJoin = (req, res) => {
    return res.render("join", {pageTitle:"Join"})
};
export const postJoin = async(req, res) => {
    const { email, username, password, password2, name, location } = req.body;
    const pageTitle= "Join";
    if(password!==password2){
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "Password confirmation does not match.",
        })
    }
    const exists = await User.exists({$or:[{username}, {email}]});
    if(exists){
        return res.status(400).render("join", {
            pageTitle,
            errorMessage:"This username/email is already taken.",
        });
    }
    try{
        await User.create({
            email, 
            username, 
            password, 
            name, 
            location,
        });
        return res.redirect("/login");
    }catch(error){
        return res.status(400).render("join", {
            pageTitle, 
            errorMessage: error._message
        });
    }
};

export const getLogin = (req, res) => {
    return res.render("login", {pageTitle: "Login"});
};

export const postLogin = async(req, res) => {
    const { username, password} = req.body;
    const pageTitle = "Login";

    console.log("Received username:", username);
    console.log("Received password:", password);

    const user = await User.findOne({ username, socialOnly:false });
    if(!user){
        console.log("User not found!");
        return res
        .status(400)
        .render("login", {
            pageTitle, 
            errorMessage:"An account with this username does not exists"
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res
        .status(400)
        .render("login", {
            pageTitle, 
            errorMessage:"Incorrect password"
        });
    }
    console.log("User data before rendering:", user);
    
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
};
export const finishGithubLogin = async(req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
            method:"POST",
            headers:{
                Accept: "application/json",
            },
        })
    ).json();
    if("access_token" in tokenRequest){
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await (
            await fetch(`${apiUrl}/user`,{
                headers:{
                    Authorization: `Bearer ${access_token}`
                },
            })
        ).json();
        const emailData = await(
            await fetch(`${apiUrl}/user/emails`,{
                headers:{
                    Authorization: `Bearer ${access_token}`,
                },
            })
        ).json();
        const emailObj = emailData.find(
            (email)=>email.primary===true&&email.verified===true
        );
        if(!emailObj){
            return res.redirect("/login");
        }
        let user = await User.findOne({email:emailObj.email});
        if(!user){
            user = await User.create({
                avatarUrl:userData.avatar_url,
                email:emailObj.email, 
                username:userData.login, 
                password:"", 
                socialOnly:true,
                name : userData.name? userData.name : "Unknown", 
                location:userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    }else{
        return res.redirect("/login");
    }
};

export const logout = (req, res) => {
    req.session.user = null;
    res.locals.loggedInUser = req.session.user;
    req.session.loggedIn = false;
    req.flash("info", "Bye Bye");
    return res.redirect("/");
}


export const getEdit = (req, res) => {
    return res.render("edit-profile", {pageTitle:"Edit Profile"});
}
export const postEdit = async(req, res) => {
    const {
        session:{
            user:{_id, avatarUrl},
        },
        body:{
            name,
            email,
            username,
            location
        },
        file,
    } = req;
    console.log(file);
    // const findUsername = await User.findOne({username})
    // const findEmail = await User.findOne({email})
    // if(findUsername._id !=_id || findEmail._id !=_id){
    //     return res.status(400).render("edit-profile", {pageTitle:"Edit Profile", errorMessage:"Email or Username already exists"})
    // }
    const updatedUser = await User.findByIdAndUpdate(
        _id, 
        {
            avatarUrl: file? file.location : avatarUrl,
            name, 
            email, 
            username, 
            location
        },
        {new:true}
    );
    req.session.user = updatedUser;
    return res.redirect("/");
};

export const getChangePassword = (req, res) => {
    if(req.session.user.socialOnly===true){
        req.flash("error", "Can't change password.");
        return res.redirect("/")
    }
    return res.render("users/change-password", {pageTitle:"Change Password"});
};
export const postChangePassword = async(req, res) => {
    const {
        session:{
            user:{_id},
        },
        body:{
            oldPassword,
            newPassword,
            newPasswordConfirmation,
        },
    } = req;
    const user = await User.findById(_id);
    const ok = await bcrypt.compare(oldPassword, user.password);
    if(!ok){
        return res.status(400).render("users/change-password", {
            pageTitle:"Change Password", 
            errorMessage:"Current password is incorrect"
        });

    }
    if(newPassword!==newPasswordConfirmation){
        return res.status(400).render("users/change-password", {
            pageTitle:"Change Password", 
            errorMessage:"New password does not match Confirmation"
        });
    }
    user.password = newPassword;
    await user.save();
    req.flash("info", "Password updated");
    return res.redirect("/users/logout");
};

export const see = async(req, res) => {
    const {id}=req.params;
    const user = await User.findById(id).populate({
        path: "videos",
        populate: {
            path: "owner",
            model: "User",
        },
    });
    if(!user){
        return res.status(404).render("404", {pageTitle:"User not Found"})
    }

    return res.render("users/profile", {
        pageTitle: `${user.name} Profile`, 
        user,
    });
}