import mongoose, { Schema, model, Model } from 'mongoose';
import { ICounterIngreso } from '../interfaces';

const counteringresoSchema = new Schema({
    organization     : { type: Schema.Types.ObjectId, ref: 'Organization', required: true },    
    seq  : { type: Number, required: true },             
}, {
    timestamps: true,
})

const CounterIngreso:Model<ICounterIngreso> = mongoose.models.CounterIngreso || model('CounterIngreso',counteringresoSchema);

export default CounterIngreso;