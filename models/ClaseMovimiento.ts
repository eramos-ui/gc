import mongoose, { Schema, model, Model } from 'mongoose';
import { IClaseMovimiento } from '../interfaces';


const claseMovimientosSchema = new Schema({
    organization     : { type: Schema.Types.ObjectId, ref: 'Organization', required: true },    
    name             : { type: String, required: true },
    ingresoGasto     : { type: String, required: true },
    ingresoSalda     : { type: Number, required: true },
    idTipoMovimiento : { type: Number, required: true },
    
}, {
    timestamps  : true,
})

const ClaseMovimiento:Model<IClaseMovimiento> = mongoose.models.ClaseMovimiento || model('ClaseMovimiento',claseMovimientosSchema);

export default ClaseMovimiento;