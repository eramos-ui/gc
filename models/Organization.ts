import mongoose, { Schema, model, Model } from 'mongoose';
import { IOrganization } from '../interfaces';

const organizationSchema = new Schema({

    name                : { type: String, required: true },
    idOrganization      : { type: Number, required: true },
    isVigente           : { type: Boolean },

}, {
    timestamps: true,
})

const Organization:Model<IOrganization> = mongoose.models.Organization || model('Organization',organizationSchema);

export default Organization;