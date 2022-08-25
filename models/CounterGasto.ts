import mongoose, { Schema, model, Model } from 'mongoose';
import { ICounterGasto } from '../interfaces';

const countergastoSchema = new Schema({
    organization     : { type: Schema.Types.ObjectId, ref: 'Organization', required: true },    
    seq  : { type: Number, required: true },             
}, {
    timestamps: true,
})

const CounterGasto:Model<ICounterGasto> = mongoose.models.CounterGasto || model('CounterGasto',countergastoSchema);

export default CounterGasto;