const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    image: String,
    caption: String,
    language: {
        type: String,
        default: 'english'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    fileId: String
}, { timestamps: true })

const postModel = mongoose.model("post", postSchema)

module.exports = postModel;