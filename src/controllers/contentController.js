import moment from 'jalali-moment'
import mongoose from 'mongoose';
import {postModel} from "../models/postModel";
import {userModel} from "../models/userModel";

export const createPost=async(req,res)=> {
    try {
        let userId = req.body.userId;
        let content = req.body.content;
        let post =new postModel;
        // upload file
        if (req.body.photo){
            let fileName = new Date().getTime().toString() + ".jpg" ;
            let file = await uploadFile(req,fileName, "posts");
            if (file)
                post.file = file;
        }

        let date = new Date().getTime();
        let pdate = moment(new Date()).locale('fa').format('YYYY/MM/DD HH:mm');
        post.userId = new mongoose.mongo.ObjectId(userId);
        post.content = content;
        post.date = date;
        post.pdate = pdate;
        await post.save();
        return res.status(200).json({"message": "post create successfully"});
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
};
export const listPost=async(req,res)=> {
    try {
        let pageNumber = req.params.pageNumber;
        let count = await postModel.count();
        let result = {};
        if (count - (pageNumber*4) > 0) {
            result.nextLink = "/post/list/" + (parseInt(pageNumber) + 1).toString();
        }
        let post = await postModel.find({}).populate('userId').populate('from')//.skip(pageNumber*4).limit(4).sort( { date: -1 } );
        result.post = post;
        return res.status(200).json(result);
    }
    catch (error) {
        console.log(error)
        return res.status(500).json(error);
    }
};

export const likePost=async(req,res)=> {
    try {
        let postId=req.body.postId;
        let userId=req.body.userId;
        let post=await postModel.findOne({_id:postId})
        if(post){
            if(post.liked.indexOf(userId)===-1){
                post.liked.push(userId);
                console.log("\n\n\n" + post + "\n\n\n");
            }
            await post.save();
            return res.status(200).json(post);
        }
        return res.status(404).json({message:"Not found"});
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}
export const unlikePost=async(req,res)=> {
    try {
        let postId=req.body.postId;
        let userId=req.body.userId;
        let post=await postModel.findOne({_id:postId})
        if(post){
            let index=post.liked.indexOf(userId);
            if(index!==-1){
                post.liked.splice(index,1)
            }
            await post.save();
            return res.status(200).json(post);
        }
        return res.status(404).json({message:"Not found"});
    }
    catch (error) {
        console.log(error)
        return res.status(500).json(error);
    }
};
export const rePost=async(req,res)=> {
    try {
        let postId=req.body.postId;
        let userId=req.body.userId;
        let post=await postModel.findOne({_id:postId})
        if(post){
            let repost =new postModel;
            repost.userId =  new mongoose.mongo.ObjectId(userId);
            repost.content = post.content;
            repost.date = post.date;
            repost.file = post.file;
            repost.pdate = post.pdate;
            repost.from = post.userId;
            await repost.save();
            return res.status(200).json(repost);
        }
        return res.status(404).json({message:"Not found"});
    }
    catch (error) {
        console.log(error)
        return res.status(500).json(error);
    }
};

export const search = async (req, res) => {
    let query = req.body.query;
    let result = [];
    if (query) {
        result.push(await userModel.find({name: { $regex: '.*' + query + '.*' } }));
        result.push(await postModel.find({content: { $regex: '.*' + query + '.*' } }).populate('userId').populate('from').sort( { date: -1 } ));
    } else {
        result.push(await userModel.find());
        result.push(await postModel.find().populate('userId').populate('from').sort( { date: -1 } ));;
    }
    return res.json({"result": result});
    // postModel.find({$or: [{name: { $regex: '.*' + query + '.*' } }]});
};

export const uploadFile = async (req,fileName, type) => {
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
