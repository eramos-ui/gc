import type { NextApiRequest, NextApiResponse } from 'next';
import moment from "moment";

import { dbCartera, dbClaseMovimiento, dbCounter, dbDocumento, dbFamilia } from '../../../database';
import { arrayFunctions} from '../../../utils'
//import {  Familia, CounterIngreso, ClaseMovimiento, Documento, Cartera } from '../../../models';
import {  IFamilia } from '../../../interfaces';


type Data = 
  {   message: string}

export default function handler (req: NextApiRequest, res: NextApiResponse<Data>) {
    //console.log( 'registraringreso method',  req.method)
    switch ( req.method) {
        case 'POST':
           return registraIngreso( req, res )
        default:
          return res.status(400).json({ message: 'Bad request' })
     } 
    res.status(200).json({ message: 'Example' })
};
const registraIngreso = async  ( req: NextApiRequest, res: NextApiResponse<Data> ) =>{
    const {  casaSelected, fechaPago, cifra , organization, userId } = req.body ;
    const  monto= parseInt(cifra.toString().replace('.','') );//sacar el separador de miles '.'   
    //console.log('casaSelected, fechaPago, cifra , organization, userId',casaSelected, fechaPago, cifra , organization, userId)
   
    // const sequencia= await CounterIngreso.find( { organization}); 
    //const counter = await  dbCounter.updateGetCounterIngreso( sequencia[0]._id );//obtiene nroDocumento Ingreso
    const counter = await  dbCounter.updateGetCounterIngreso( organization);
    const sequence:any= counter; 
    const {seq: nroDocumento }= sequence;
    //const familia:any= await Familia.findById( casaSelected );
    const familia: IFamilia = await dbFamilia.getFamiliaById( casaSelected );

    const { name, casa ='' } = familia;
    const idTipoMovimiento = 0;
    //const tipoMov= await ClaseMovimiento.findOne( {idTipoMovimiento}  );
    const tipoMov= await dbClaseMovimiento.getClaseMovimientoByIdTipoMov( idTipoMovimiento  );
    const fechaMovimiento = moment().format('YYYY-MM-DD')
    const doc: any ={
      tipoDocumento  : 'INGRESO',
      nroDocumento   : nroDocumento,
      fechaDocumento : fechaPago,
      monto          : monto,
      comentario     : '',  
      usuario        : userId,
      tipoMovimiento : tipoMov?._id, 
      casa           ,//en los gastos no va la casa
      familiaName    : name,
    }  
    //console.log('doc',doc) ;
  
    // const docu:any=await Documento.insertMany( doc)
    // .then((docs) => {return  docs})
    // .catch((err) => {
    //   console.log(err);
    // });
    //
    const { _id:documentoId } = await dbDocumento.postDocumento( doc );
    //const documentoId:string=docu[0]._id;//al id del doc insertado, [0] es x insertMany que es 1 sólo    

    //Obtención de la deuda de la casa  
    const movCartera= await dbCartera.getAllMovCarteraByCasa( organization, casa)//e/s cartera
    const movs=movCartera.map( mov =>{//los mov de la cartera  ordenados y con groupBy
       const {  documentoRef,  fechaDocumento, tipoMovimiento, monto, mesPago, entradaSalida } = mov; 
       const tm=tipoMovimiento._id;
       const {tipoDocumento: tipoDocumentoRef, nroDocumento: nroDocumentoRef}= <any>documentoRef;   
       const documentoRefId=documentoRef?._id

       const groupBy=tipoDocumentoRef +'-'+ nroDocumentoRef.toString() + '-' +mesPago?.toString()
             +'-' + tm +'-' +documentoRefId + '-'+ tipoMovimiento.idTipoMovimiento.toString();   
       const montoConSigno=(entradaSalida  === 'E') ?monto: -monto;
       return {fechaDocumento, monto: montoConSigno, mesPago, entradaSalida, groupBy}
    }).sort((a, b) => moment(a.fechaDocumento, 'YYYY-MM-DD').diff(moment(b.fechaDocumento, 'YYYY-MM-DD')));
    const listaRows =  arrayFunctions.getDistinctKeysFromArray( movs, 'groupBy' ).sort();//listado group by para sumar
    
    const mesPagoSaldo= listaRows.map( gr =>{//los valores adeudados ordenados groupBy
      const found= movs.filter( mo => mo.groupBy === gr )
      const saldo = found.reduce( (previousValue:number, current:any ) =>   previousValue +   current.monto  , 0); 
      return { groupBy: gr, saldo, pagado:0 }
    }).filter( ms => ms.saldo !== 0);
    let abono=monto;
    let paga=0;
    const abonado = mesPagoSaldo.map( sa => {//losvalores x mes con los bonos dado el monto
       paga=0;
       if (abono > 0 ){
        paga=(sa.saldo <= abono )? sa.saldo : abono;
        abono = ( (abono - paga) >0 )? ( abono - paga ): 0 ;
       }
       return  {...sa, pagado: paga}
    });
   
    const docAbona=abonado.map( ab => {//prepara los movimientos a abonar en cartera con monto>0
       const {tipoDocumento, nroDocumento, fechaDocumento}=doc;
       const groupBy=ab.groupBy;
       const keys= groupBy.split('-');
       const tipoDocumentoRef=keys[0];
       const nroDocumentoRef=keys[1];
       const tipoMovimiento=keys[3];
       const mesPago=keys[2];
       const docuenteRefId=keys[4];
       const claseMov=keys[5];
       const entradaSalida='S';
       
       return {tipoDocumento, nroDocumento,tipoDocumentoRef,nroDocumentoRef,fechaDocumento,fechaMovimiento,claseMovimiento:claseMov
           ,documento:documentoId,mesPago,entradaSalida,monto: ab.pagado, casa, tipoMovimiento, documentoRef:docuenteRefId, idTipoMovimiento } 
    }).filter( ab => ab.monto >0 );  
    //await Cartera.insertMany( docAbona);
    const abona=await dbCartera.postDocCarteraGasto( docAbona )
    return  res.status(200).json({ message: 'Registrado OK' });
}
