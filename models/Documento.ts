import mongoose, { Schema, model, Model } from 'mongoose';
import { IDocumento } from '../interfaces';


const documentoSchema = new Schema({
    casa           : { type: Schema.Types.ObjectId, ref: 'Casa', required: true },
    usuario        : { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tipoMovimiento : { type: Schema.Types.ObjectId, ref: 'ClaseMovimiento', required: true },
    tipoDocumento  : { type: String },    
    nroDocumento   : { type: Number },
    familiaName    : { type: String },
    fechaDocumento : { type: String, required: true },
    monto          : { type: Number, required: true },
    comentario     : { type: String },
}, {
    timestamps  : true,
})

const Documento:Model<IDocumento> = mongoose.models.Documento || model('Documento',documentoSchema);

export default Documento;