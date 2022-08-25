
import { db } from '.';
//import Documento from '../models/Documento';

import { ICartera, IDocumento } from '../interfaces';
import { Cartera, Documento } from '../models';

 export const getCarteraByCasa = async (organization: string, casa: string ) : Promise<ICartera[]> =>{
    await db.connect();
     const doctos = await Cartera.find({ organization, entradaSalida:'S', casa })// los ingresos efectivos realizados por una casa
        .populate('tipoMovimiento',{ name: 1, idTipoMovimiento:1, ingresoSalda: 1, _id:0})
        .populate('casa', { codigo: 1, _id:0 })
        .populate('documento',{ tipoDocumento: 1, nroDocumento: 1, familiaName: 1 , comentario: 1, _id:0  })
        .select( '-fechaMovimiento').lean();

    await db.disconnect();
    //console.log(doctos)
    return JSON.parse(JSON.stringify(doctos));
 };
 export const getDocumentoByTipoNro = async (organization: string, tipoDocumento: string, nroDocumento: number ) => {
   await db.connect();
   const docto = await Documento.findOne({ organization, tipoDocumento, nroDocumento }).lean();
   await db.disconnect();
   return JSON.parse(JSON.stringify(docto));
 };
 export const postDocumento = async (doc: IDocumento ) => {
   await db.connect();
   const docu:any = await Documento.insertMany( doc)
      .then((docs) => {return  docs})
      .catch((err) => {
           console.log(err);
           return;
   });
    await db.disconnect();
    return JSON.parse(JSON.stringify( docu[0] ));
 };
