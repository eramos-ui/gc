import type { NextApiRequest, NextApiResponse } from 'next';
import moment from "moment";

import {  dbCartera, dbClaseMovimiento, dbCounter, dbDocumento, dbFamilia } from '../../../database';
import { ICartola } from '../../../interfaces';



type Data = 
  {   message: string}

export default function handler (req: NextApiRequest, res: NextApiResponse<Data>) {
    switch ( req.method) {
        case 'POST':
           return registraGasto( req, res )
        default:
          return res.status(400).json({ message: 'Bad request' })
     } 
    res.status(200).json({ message: 'Example' })
};
const registraGasto = async  ( req: NextApiRequest, res: NextApiResponse<Data> ) =>{
    const {  gastoSelected, fechaPago, cifra, comentario, organization, userId } = req.body ;
    const  monto= parseInt(cifra.toString().replace('.','') );

    // const sequencia= await CounterGasto.find( { organization}); 
    // const counter = await  dbCounter.updateGetCounterGasto( sequencia[0]._id );//obtiene nroDocumento Ingreso

    const counter = await  dbCounter.updateGetCounterIngreso( organization);

    const sequence:any= counter; 
    const {seq: nroDocumento }= sequence;
    //const movCartera= await dbCartera.getAllMovCarteraByCasa( organization, casa)//e/s cartera
    const claseMov= await dbClaseMovimiento.getAllClaseMovimiento(  organization );
    const clSelected = claseMov.find( c => c._id === gastoSelected ); 
    
    const idTipoMovimiento=clSelected?.idTipoMovimiento;

    //const casa = await Casa.findOne({ codigo:'TODAS'} );  
    //getCasaByCodigo
    const casa: any = await dbFamilia.getCasaByCodigo('TODAS');

    //const casaId=casa?._id;
    //console.log('nroDocumento,gastoSelected,casaId',nroDocumento,gastoSelected, casa, comentario) 

    const fechaMovimiento = moment().format('YYYY-MM-DD')
   
    const doc: any ={
      tipoDocumento  : 'GASTO',
      nroDocumento   : nroDocumento,
      fechaDocumento : fechaPago,
      monto          : monto,
      comentario     ,  
      usuario        : userId,
      tipoMovimiento : gastoSelected, 
      casa           : casa?._id,//en los gastos la casa es TODAS
      familiaName    : '',
    }; 
    
    // const docu:any=await Documento.insertMany( doc)
    // .then((docs) => {return  docs})
    // .catch((err) => {
    //   console.log(err);
    // });

    const docInsert = await dbDocumento.postDocumento( doc );
    // const docInsert= docu[0];// [0] es x insertMany que es 1 sólo    
    // const documentoId:string=docInsert._id;

    //inserta en la cartera de gastos el gasto  

    const tipoMovimiento=docInsert.tipoMovimiento;
    
    const mov: any = {
      tipoMovimiento  : docInsert.tipoMovimiento, 
      documento       : docInsert._id,
      documentoRef    : docInsert._id,
      fechaDocumento  : docInsert.fechaDocumento,
      fechaMovimiento : fechaMovimiento,
      monto           : docInsert.monto,
      entradaSalida   : 'E',
      tipoDocumento   : docInsert.tipoDocumento,
      nroDocumento    : docInsert.nroDocumento,
      tipoDocumentoRef: docInsert.tipoDocumento,
      nroDocumentoRef : docInsert.nroDocumento,
      idTipoMovimiento: idTipoMovimiento
    };
    //console.log('mov',mov);
    //const movs:any=await CarteraGasto.insertMany( mov );
    const movs=await dbCartera.postDocCarteraGasto( mov )
    const gastosConSaldo=  await dbCartera.getGastosNoNeteados( organization);//los  gastos no neteados con un ingreso

    if (gastosConSaldo.length >0 ) neteaIngresosConGastos( organization, fechaMovimiento, gastoSelected, gastosConSaldo );
    return  res.status(200).json({ message: 'Registrado OK' });
};

const neteaIngresosConGastos= async ( organization: string, fechaMovimiento: string, gastoSelected: string , gastosConSaldo: ICartola[] ) => {
  //los ingresos no ocupados en la cartera de gastos 
  //lee en la cartera ingresos los que tienen saldo en la de gasto
  let ingresosConSaldo: any[] = await dbCartera.getIngresosNoNeteados( organization);
  //inserta en la cartera de gastos, elingreso compensamdo el gasto  
  let ingreso = <ICartola>{};
  const neteoGasto =gastosConSaldo.map( ({ saldo:deuda=0 , tipoDocumento:tipoDocumentoRef, nroDocumento: nroDocumentoRef, 
       tipoMovimiento, idTipoMovimiento, documento: documentoRef }) => { 
    const ingresoSalda=(idTipoMovimiento !== 99) ? 1000: 1001;
    ingreso =  ingresosConSaldo.find( ( {saldo = 0, idTipoMovimiento = 0 }) => (saldo > 0 && idTipoMovimiento === ingresoSalda) );
    if ( ingreso ){
      const { tipoDocumento, nroDocumento, documento, saldo:monto=0, fechaDocumento } = ingreso;
      const abona = (deuda<= monto)? deuda: monto;
      const newSaldo= monto-abona;
      const entradaSalida='S';
      if ( abona ){
        const ss = ingresosConSaldo.map( x => (x.documento === ingreso.documento ) ? { ...x, saldo: newSaldo  } : x );
        ingresosConSaldo = ss;   
        return { tipoDocumento, nroDocumento, fechaDocumento, tipoDocumentoRef, nroDocumentoRef, monto: abona,
           idTipoMovimiento, fechaMovimiento, entradaSalida, tipoMovimiento: gastoSelected, documento, documentoRef }
      }else {
        return null;  
      }
    }else {
      return null;
    }    
  }).filter (z => z);
  //const movs:any=await CarteraGasto.insertMany( neteoGasto )
  const movs=await dbCartera.postDocCarteraGasto( neteoGasto );
  //console.log('movs',movs);
};

