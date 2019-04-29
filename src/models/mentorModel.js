import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const MentorSchema = {
    requester: {
        type: Schema.ObjectId,
        ref: 'user'
    },
    requested: {
        type: Schema.ObjectId,
        ref: 'user'
    },
    rate: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'INPROGRESS', 'DONE']
    },
    type: {
        type: String,
        enum: ['MENTORSHIP', 'FRIENDSHIP']
    },
};

const mentor = new Schema(MentorSchema);

export const mentorModel = mongoose.model('mentor', mentor);
