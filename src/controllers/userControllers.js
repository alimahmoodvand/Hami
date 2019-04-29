import jwt from 'jsonwebtoken';
import {userModel} from "../models/userModel";
import {postModel} from "../models/postModel";
import {mentorModel} from "../models/mentorModel";
import mongoose from 'mongoose';
export const login = async (req, res)=> {
    let phoneNumber = req.body.phoneNumber;
    let verificationCode = Math.floor(Math.random()*90000) + 10000;
    try {
        let fetchedUser = await userModel.findOne(
            {phoneNumber}
        );
        if(fetchedUser){
            fetchedUser.verificationCode = verificationCode;
        }else{
            fetchedUser = new userModel;
            fetchedUser.phoneNumber = phoneNumber;
            fetchedUser.verificationCode = verificationCode;
        }
        await fetchedUser.save();
        sendSms(phoneNumber, verificationCode, (err, response) => {
            console.log(err, response)
            // if (err) {
            //     console.log(err);
            //     return res.status(500).json(error);
            // } else {
            //     return res.json({"message":"verification code sent"});
            // }
        });
            return res.json(fetchedUser);
            // return res.json({"message":"verification code sent"});
    } catch (error) {
        return res.status(500).json(error);
    }
};

export const verify = async (req, res)=> {
    let phoneNumber = req.body.phoneNumber;
    let vercode = req.body.vercode;
    try {
        let fetchedUser = await userModel.findOne({phoneNumber});
        if (fetchedUser) {
            // check vercode if ok create and insert token else return error
            if (fetchedUser.verificationCode === vercode) {
                fetchedUser.token = jwt.sign({
                    phoneNumber: fetchedUser.phoneNumber,
                    lastLogin: new Date().getTime()
                }, secretKey);
                await fetchedUser.save();
                return res.json(fetchedUser);
            } else {
                return res.status(409).json({"error": "verification code does not match"});
            }
        } else {
            return res.status(404).json({"error": "user not found"});
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};
export const signup = async (req, res)=> {
    let phoneNumber = req.body.phoneNumber;
    let name = req.body.name;
    let role = req.body.role;
    let bio = req.body.bio;

    try {
        // check phone number and vercode if matched first create and insert token
        let fetchedUser = await userModel.findOne({phoneNumber});
        if (fetchedUser) {
            // check vercode if ok create and insert token else return error
            fetchedUser.name = name;
            fetchedUser.role = role;
            fetchedUser.bio = bio;
            // upload file
            if (req.body.photo){
                let fileName = new Date().getTime().toString() + ".jpg";
                let file = await uploadFile(req,fileName, "profiles");
                if (file)
                    fetchedUser.image = file;
            }
            await fetchedUser.save();
            return res.json(fetchedUser);
        } else {
            return res.status(404).json({"error": "user not found"});
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

export const loginRequired = async (req, res, next)=> {
    console.log(req.body)
    next();
    return;
    // let phoneNumber = req.body.phoneNumber;

    // let token = null;
    // console.log(req.headers)
    // if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    //     token = req.headers.authorization.split(' ')[1];
    // }
    // try {// check phone number and token if matched allow
    //     console.log(token)
    //     let fetchedUser = await userModel.findOne({token});
    //     if (fetchedUser) {
    //         req.user = fetchedUser
    //         next();
    //     }
    //     else
    //         return res.status(401).json({message: 'Unauthorized user!'});
    // } catch (error) {
    //     return res.status(500).json(error);
    // }
    // req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    // jsonwebtoken.verify(req.headers.authorization.split(' ')[1], secretKey, (err, decode) => {
    //
    // };
}
    export const logout = async (req, res) => {
        let phoneNumber = req.body.phoneNumber;
        try {
            // check phone number and delete token
            let fetchedUser = await userModel.findOne({phoneNumber});
            if (fetchedUser) {
                fetchedUser.token = "";
                await fetchedUser.save();
                res.json({"message": "logout successfully"});
            } else {
                return res.status(404).json({"error": "user not found"});
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    };


// helper functions
    const sendSms = (mobileNumber, text, cb) => {
        var qs = require("querystring");
        var http = require("http");
        console.log(text)
        var options = {
            "method": "POST",
            "hostname": "sabapayamak.com",
            "port": null,
            "path": "/Post/SendSms.ashx",
            "headers": {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
            }
        };

        var req = http.request(options, function (res) {
            var chunks = [];
            console.log("res")
            res.on("data", function (chunk) {
                console.log("data", chunk)
                chunks.push(chunk);
            });

            res.on("error", function (err) {
                console.log("error", err)
                return cb(err, null);
            });

            res.on("end", function () {
                console.log("end")
                var body = Buffer.concat(chunks);
                return cb(null, {body: body.toString()});
            });
        });
        console.log(qs.stringify({
            username: 'dibaanzh',
            password: '1234567890',
            // from: '30008561661151',
            from: '30008561242550',
            to: mobileNumber,
            text: text
        }))
        req.write(qs.stringify({
            username: 'dibaanzh',
            password: '1234567890',
            // from: '30008561661151',
            from: '30008561242550',
            to: mobileNumber,
            text: text
        }));
        req.end();
    };

    export const profile = async (req, res) => {
        let phoneNumber = req.body.phoneNumber;
        try {
            let user = await userModel.findOne({phoneNumber});
            let mentors = await mentorModel.find({})
                // {$or:[{requested:new mongoose.mongo.ObjectId(user._id),
                //     requester:new mongoose.mongo.ObjectId(req.user._id)},{requested:new mongoose.mongo.ObjectId(req.user._id),requester:new mongoose.mongo.ObjectId(user._id)}],type:"MENTORSHIP"});
                //         let friends = await mentorModel.find({})
                    //         {$or:[{requested:new mongoose.mongo.ObjectId(user._id),
                    // requester:new mongoose.mongo.ObjectId(req.user._id)},{requested:new mongoose.mongo.ObjectId(req.user._id),requester:new mongoose.mongo.ObjectId(user._id)}],type:"FRIENDSHIP"});
            let mentor=null;
            let friend=null;
            // for(let i=0;i<mentors.length;i++){
            //     console.log(mentors[i].requested===user._id,mentors[i].requester===req.user._id,mentors[i].requester,req.user._id)
            //     if(
            //         ((mentors[i].requested===user._id&&mentors[i].requester===req.user._id)||
            //         (mentors[i].requested===req.user._id&&mentors[i].requester===user._id)))
            //     {
            //         if(mentors[i].type==="MENTORSHIP")
            //         mentor=mentors[i]
            //         if(mentors[i].type==="FRIENDSHIP")
            //         friend=mentors[i]
            //     }
            // }
            if (user) {
                let relation={};
                relation.mentor=mentor;
                relation.friend=friend;
                let posts = await postModel.find({userId: user._id}).populate('userId').populate('from');
                return res.status(200).json([(user), posts,relation]);
            } else {
                return res.status(404).json({"error": "user not found"});
            }
        }
        catch (error) {
            console.log(error)
            return res.status(500).json(error);
        }
    };

    export const uploadFile = async (req, fileName, type) => {
        try {
            const baseUrl = "/var/www/hackahealth/api/public/images";
            const baseLink = "http://5.152.223.102:3010/images";
            let url = baseUrl + "/" + type + "/" + fileName;
            let link = baseLink + "/" + type + "/" + fileName;
            require("fs").writeFileSync(url, req.body.photo, 'base64')

            //      await req.files.photo.mv(url)
            return link;
        } catch (error) {
            console.log(error)
            return false;
        }
    };

    export const rateMentor = async (req, res) => {
        let mentee = req.body.mentee;
        let mentor = req.body.mentor;
        let rate = req.body.rate;
        let mentorshipRel = await mentorModel.findOne({$and: [{mentee: mentee}, {mentor: mentor}, {active: "INPROGRESS"}]})
            .populate('requester').populate('requested');
        if (mentorshipRel) {
            mentorshipRel.rate = rate;
            mentorshipRel.active = 'DONE';
            await mentorshipRel.save();
            let mentorRates = await mentorModel.find({requested: requested});
            let agg = 0;
            let len = mentorRates.length;
            for (let i = 0; i < len; i++)
                agg += mentorRates[i].rate;
            let averageRate = (agg / len);
            return res.json({"averageRate": averageRate});
        } else {
            return res.status(404).json({"error": "relationship not found"});
        }
    };


    export const changeMentoringStatus = async (req, res) => {
        let status = req.params.status;
        let phoneNumber = req.body.phoneNumber;
        let fetchedUser = await userModel.findOne({phoneNumber});
        if (fetchedUser) {
            if (fetchedUser.mentoring === status)
                return res.status(409).json({"error": "user already in this state"});
            fetchedUser.mentoring = status;
            await fetchedUser.save();
            return res.json(fetchedUser);
        } else {
            return res.status(404).json({"error": "user not found"});
        }
    };

    export const changeMentoredStatus = async (req, res) => {
        let status = req.params.status;
        let phoneNumber = req.body.phoneNumber;
        let fetchedUser = await userModel.findOne({phoneNumber});
        if (fetchedUser) {
            if (fetchedUser.mentored === status)
                return res.status(409).json({"error": "user already in this state"});
            fetchedUser.mentored = status;
            await fetchedUser.save();
            return res.json(fetchedUser);
        } else {
            return res.status(404).json({"error": "user not found"});
        }
    };
    export const getMentors = async (req, res) => {
        let results = {};
        results.mentored = await userModel.find({mentored: "YES"});
        results.mentoring = await userModel.find({mentoring: "YES"});
        return res.json(results);
    };
    export const handleMentorship = async (req, res) => {
        let action = req.params.action;
        let requester = req.body.requester;
        let requested = req.body.requested;
        let mentorM = new mentorModel;
        mentorM.type = req.body.type;
        if (req.body.type === "MENTORSHIP") {
            mentorM.status = "PENDING"
        } else {
            mentorM.status = "DONE"
        }
        mentorM.requester = new mongoose.mongo.ObjectId(req.body.requester);
        mentorM.requested = new mongoose.mongo.ObjectId(req.body.requested);
        await mentorM.save();
        return res.status(200).json({"message":"create mentor"});
    }
export const getMentored = async (req, res) => {
    let fetchedUsers = await userModel.find({mentored:"YES"});
    if (Array.isArray(fetchedUsers)) {
        return res.json(fetchedUsers);
    } else {
        return res.status(404).json({"error": "user not found"});
    }
};
export const getMentoring= async (req, res) => {
    let fetchedUsers = await userModel.find({mentoring:"YES"});
    if (Array.isArray(fetchedUsers)) {
        return res.json(fetchedUsers);
    } else {
        return res.status(404).json({"error": "user not found"});
    }
};