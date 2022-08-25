
import {Cartera , CarteraGasto, ClaseMovimiento} from '../models';
import { db, dbClaseMovimiento } from '.';
import { ICartola} from '../interfaces';
import { arrayFunctions } from '../utils'
import { ICartera } from '../interfaces/cartera';


export const getAllIngresos = async (organization: string ) : Promise<ICartola[]>=> {
    await db.connect();
    const ingresos = await Cartera.find({ organization, entradaSalida:'S' })// las entradaSalida='S son ingresos efectivos
                        .populate('tipoMovimiento',{ name: 1, idTipoMovimiento:1, ingresoSalda: 1, _id: 1})
                        .populate('casa', { codigo:1, _id: 1 })
                        .populate('documento',{ tipoDocumento: 1, nroDocumento: 1, familiaName: 1 , comentario: 1, _id: 1  })
                        .populate('documentoRef',{ tipoDocumento: 1, nroDocumento: 1, _id: 1 })
                        .select( '-fechaMovimiento').lean();
    await db.disconnect();
    return JSON.parse(JSON.stringify(ingresos));
 }
 export const getAllGastos = async (organization: string ) : Promise<ICartola[]> => {
    await db.connect();
    const gastos = await CarteraGasto.find({ organization })
                        .populate('tipoMovimiento',{ name: 1, idTipoMovimiento:1,ingresoSalda: 1, _id: 1})
                        .populate('documento',{ tipoDocumento: 1, nroDocumento: 1, familiaName: 1 , comentario: 1, _id: 1  })
                        .populate('documentoRef',{ tipoDocumento: 1, nroDocumento: 1 , _id: 1  })
                        .select('-fechaMovimiento')
                        .lean();
    await db.disconnect();
    return JSON.parse(JSON.stringify( gastos ));
 }
 export const getCarteraIngresoById = async (organization: string, idMovimiento: string ) =>{
    await db.connect();
    const movimiento= await Cartera.findOne( {_id: idMovimiento} )
    await db.disconnect();
    return JSON.parse(JSON.stringify( movimiento ));
    
 }
 export const getCarteraGastoById = async ( organization: string, idMovimiento: string ) =>{
    await db.connect();
    const movimiento= await CarteraGasto.findOne( {_id: idMovimiento} )
    await db.disconnect();
    return JSON.parse(JSON.stringify( movimiento ));
 }
 export const getCarteraByCasa = async (organization: string, casa: string ) : Promise<ICartola[]> =>{
   await db.connect();
   const doctos = await Cartera.find({ organization, entradaSalida:'S', casa })// los ingresos efectivos realizados por una casa
       .populate('tipoMovimiento',{ name: 1, idTipoMovimiento:1, ingresoSalda: 1, _id:0})
       .populate('casa', { codigo: 1, _id:0 })
       .populate('documento',{ tipoDocumento: 1, nroDocumento: 1, familiaName: 1 , comentario: 1, _id:0  })
       .select( '-fechaMovimiento').lean();

   await db.disconnect();
   //console.log(doctos)
   return JSON.parse(JSON.stringify(doctos));
}
export const getAllMovCarteraByCasa = async (organization: string, casa: string ) : Promise<ICartola[]> =>{
   await db.connect();
   const movtos = await Cartera.find({ organization, casa })// los ingresos efectivos realizados por una casa
       .populate('tipoMovimiento',{ name: 1, idTipoMovimiento:1, ingresoSalda: 1, _id:1})       
       .populate('casa', { codigo: 1, _id:0 })
       .populate('documento',{ tipoDocumento: 1, nroDocumento: 1, familiaName: 1 , comentario: 1, _id:1 })
       .populate('documentoRef',{ tipoDocumento: 1, nroDocumento: 1, familiaName: 1 , comentario: 1, _id:1  })
       .select( '-fechaMovimiento').lean();
   await db.disconnect();
   return JSON.parse(JSON.stringify(movtos));
}
export const getIngresosNoNeteados= async ( organization: string ) : Promise<ICartola[]> =>{
   await db.connect();
   const claseMov = await ClaseMovimiento.find( {organization});
   const ingres = await getAllIngresos( organization);
   const gastos= await CarteraGasto.find({ organization }); //todos
   const ingresosEnGastos=gastos.filter( x => x.entradaSalida === 'S' );//los ingresos que están parcial o totalmente netetados
   // const keysGasto=gastos.map( gto => { 
   //    return { keyGroupBy:gto.tipoDocumentoRef + '-' + gto.nroDocumentoRef.toString()  };
   //  } );
   //  const keysGastoGroup=arrayFunctions.getDistinctKeysFromArray(keysGasto,'keyGroupBy');
   //  const usedGastoKeys= keysGastoGroup.map( gr =>{ 
   //    const elem= gr.split('-');
   //    const tipoDoc=elem[0];
   //    const nroDoc=parseInt(elem[1]);
   //    const founds = gastos.filter( ga => ga.tipoDocumentoRef === tipoDoc && ga.nroDocumentoRef === nroDoc); // && 
   //    const totalNeteado = founds.reduce((total: number, mv) => ( ( mv.entradaSalida === 'E' )? total + mv.monto : total - mv.monto), 0);
   //    return { tipoDocumentoRef: tipoDoc, nroDocumentoRef: nroDoc ,  saldo: totalNeteado }
   //  })
   const keys=ingresosEnGastos.map( ing => { 
      const cl=claseMov.find( cl => cl.idTipoMovimiento === ing.idTipoMovimiento); 
      return { keyGroupBy:ing.tipoDocumento + '-' + ing.nroDocumento.toString() + '-' +cl?.ingresoSalda  };
    } );
    const keysGroup=arrayFunctions.getDistinctKeysFromArray(keys,'keyGroupBy');
    const ingresosConSaldo= keysGroup.map( gr =>{
      const elem= gr.split('-');
      const tipoDoc=elem[0];
      const nroDoc=parseInt(elem[1]);
      const idTipoMov=parseInt(elem[2]);      

      const founds = ingresosEnGastos.filter( ga => ga.tipoDocumento === tipoDoc && ga.nroDocumento === nroDoc && 
        ((idTipoMov === 1000 && ga.idTipoMovimiento !== 99 ) || (idTipoMov === 1001 && ga.idTipoMovimiento === 99 )));//1000 es normal y 1001 extraordinario
      const foundIngreso = ingres.filter( ga => ga.tipoDocumento === tipoDoc && ga.nroDocumento === nroDoc && ga.tipoMovimiento.idTipoMovimiento === idTipoMov); 
      const documento=founds[0].documento;
      const fechaDocumento=founds[0].fechaDocumento;
      const totalNeteado = founds.reduce((total: number, mv) => total + mv.monto, 0);
      const total = foundIngreso.reduce((total: number, mv) => total + mv.monto, 0);
      return { tipoDocumento: tipoDoc, nroDocumento: nroDoc, fechaDocumento , idTipoMovimiento: idTipoMov, total, 
            used:totalNeteado, saldo: total - totalNeteado, documento }
    }).filter( s => s. saldo > 0);//sólo los ingresos con saldo    
   
   await db.disconnect();
   return JSON.parse(JSON.stringify(ingresosConSaldo));
}
export const getGastosNoNeteados= async ( organization: string ) : Promise<ICartola[]> =>{
   await db.connect();  
   const gastos= await CarteraGasto.find({ organization }); //todos
   const keysGasto=gastos.map( gto => { 
      return { keyGroupBy:gto.tipoDocumentoRef + '-' + gto.nroDocumentoRef.toString() +'-' +gto.idTipoMovimiento.toString()  };
    } );
    const keysGastoGroup=arrayFunctions.getDistinctKeysFromArray(keysGasto,'keyGroupBy');
    const gastosConSaldo= keysGastoGroup.map( gr =>{ 
      const elem= gr.split('-');
      const tipoDoc=elem[0];
      const nroDoc=parseInt(elem[1]);
      const idTipoMovimiento=parseInt(elem[2]);
      const founds = gastos.filter( ga => ga.tipoDocumentoRef === tipoDoc && ga.nroDocumentoRef === nroDoc); // && 
      const documento=founds[0].documento;
      const totalNeteado = founds.reduce((total: number, mv) => ( ( mv.entradaSalida === 'E' )? total + mv.monto : total - mv.monto), 0);
      return { tipoDocumento: tipoDoc, nroDocumento: nroDoc ,  saldo: totalNeteado, idTipoMovimiento , documento }
    }).filter( s => s. saldo > 0);
    //console.log('usedGastoKeys',usedGastoKeys)   
   await db.disconnect();
   return JSON.parse(JSON.stringify(gastosConSaldo));
};
export const postDocCarteraGasto= async ( docAbona: any[] ) : Promise<ICartola[]> =>{
   await db.connect();  
   const movs=await CarteraGasto.insertMany( docAbona);
   await db.disconnect();
   return JSON.parse(JSON.stringify(movs));
}
