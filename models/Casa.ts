import mongoose, { Schema, model, Model } from 'mongoose';
import { ICasa } from '../interfaces';
/*
    _id          : string;
    codigo       : string;
    organizacion?: boolean;
*/

const casaSchema = new Schema({
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    codigo      : { type: String, required: true },
}, {
    timestamps  : true,
})

const Casa:Model<ICasa> = mongoose.models.Casa || model('Casa',casaSchema);

export default Casa;