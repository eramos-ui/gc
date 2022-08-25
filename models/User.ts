import mongoose, { Schema, model, Model } from 'mongoose';
import { IUser } from '../interfaces';

const userSchema = new Schema({
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name        : { type: String, required: true },
    email       : { type: String, required: true, unique: true },
    password    : { type: String, required: true },
    idUsuario   : { type: Number},
    role: {
        type: String,
        enum: {
            values  : ['admin','client', 'super-user','SEO'],
            message : '{VALUE} no es un role válido',
            default : 'client',
            required: true
        }
    }
}, {
    timestamps  : true,
})

const User:Model<IUser> = mongoose.models.User || model('User',userSchema);

export default User;