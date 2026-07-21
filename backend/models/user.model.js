import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({

    name : {
        type: String,
        required : true,
    },
    username:{
        type: String,
        required : true,
        unique : true
    },
    email:{
        type: String,
        required : true,
        unique : true
    },
       password : {
        type:String,
        required : function() {
            return this.authProvider === "local";
        },
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    profileImage:{
        type:String
    },
    bio:{
        type:String
    },
    profession:{
        type:String
    },
    gender:{
        type:String,
        enum:["male","female"]
    },
    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
     following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    posts :[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }],
     saved :[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }]
,
scrolls:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Scroll"
    }],
    story:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Story"
    }],
    resetOtp:{
        type:String
    },
    OtpExpires:{
        type:Date
    },
    isOtpVerified:{
        type:Boolean,
        default:false
    }


},{
    timestamps: true
})

const User = mongoose.model("User",UserSchema)
export default User