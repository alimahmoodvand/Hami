import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = {
    name: {
        type: String,
    },
    phoneNumber: {
        type: String,
        unique : true
    },
    pic: {
        type: String,
    },
    role: {
        type: String,
        enum: ['DOCTOR', 'MEMBER'],
    },
    mentoring: {
        type: String,
        enum: ['YES', 'NO'],
        default: "NO"
    },
    mentored: {
        type: String,
        enum: ['YES', 'NO'],
        default: "NO"
    },
    bio: {
        type: String,
    },
    image: {
        type: String,
        default: 'https://cdn.macrumors.com/article-new/2019/04/guest-user-250x250.jpg'
    },
    token: {
        type: String,
    },
    verificationCode: {
        type: String,
    }
};

const user = new Schema(UserSchema);

export const userModel = mongoose.model('user', user);
