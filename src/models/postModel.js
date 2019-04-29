import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const PostSchema = {
    userId: {
        type: Schema.ObjectId,
        ref: 'user'
    },
    content: {
        type: String,
    },
    file: {
        type: String,
        // default: 'https://ki.se/sites/default/files/styles/adaptive/public/2018/10/19/istock_host_autumn_fall_water.jpg?itok=j4g1ciLW'
    },
    date: {
        type: String,
    },
    pdate: {
        type: String,
    },
    liked: [],
    from: {
        type: Schema.ObjectId,
        ref: 'user'
    }
};

const post = new Schema(PostSchema, { usePushEach: true });

export const postModel = mongoose.model('post', post);
