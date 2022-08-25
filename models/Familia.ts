import mongoose, { Schema, model, Model } from 'mongoose';
import { IFamilia } from '../interfaces';

const familiaSchema = new Schema({
    organization  : { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    casa          : { type: Schema.Types.ObjectId, ref: 'Casa', required: true },    
    name          : { type: String, required: true },
    idOrganization: { type: Number, required: true },
    codigoCasa    : { type: String, required: true },
    mesInicio     : { type: Number, required: true },
    
    

}, {
    timestamps: true,
})

const Familia:Model<IFamilia> = mongoose.models.Familia || model('Familia',familiaSchema);

export default Familia;