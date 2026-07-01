import mongoose from "mongoose";
const PostSchema = new mongoose.Schema({

    author : {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required : true,
    },
    mediaType :{
        type: String,
        enum : ["image","video"],
        required: true
    },
    media:{
        type: String,
        required : true
        
    },
       caption : {
        type:String

        
    },
    
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
     comments :[
        
        {

  author:  {     
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"},
message:{
    type:String
}
    }]


},{
    timestamps: true
})


const Post = mongoose.model("Post",PostSchema)
export default Post