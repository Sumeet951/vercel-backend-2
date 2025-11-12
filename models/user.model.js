import { Schema,model } from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
const userSchema=new Schema({
    fullName:{
        type:'String',
        required:[true,'fullname is required'],
        minLength:[5,'fullname must be at least 5 character'],
        maxLength:[50,"fullname should be less than 50 character"],
        lowercase:true,
        trim:true, //first and last side space trim karke rakhega
    },
    email:{
        type:'String',
        required:[true,'Email is required'],
        lowercase:true,
        trim:true,
        unique:true,
    },
    password:{
        type:'String',
        required:[true,'Password is required'],
        minLength:[8,'Password must be atleast 8 character'],
        select:false
    },
     role:{
        type:'String',
        enum:['USER','ADMIN'],
        default:'USER'
    },
},{
    timestamps:true
});
userSchema.methods = {
    generateJWTToken: async function () {
        return await jwt.sign(
            { id: this._id, email: this.email, role: this.role },
            "superSecretJWTkey",
            { expiresIn: '24h' }
        );
    },
    hashPassword: async function () {
        this.password = await bcrypt.hash(this.password, 10);
    },

    comparePassword: async function (password) {
        return await bcrypt.compare(password, this.password);
      },
};
const User=model('User',userSchema);
export default User;