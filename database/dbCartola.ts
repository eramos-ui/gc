import { dbCartera } from ".";
import moment from "moment";

export const getCartolaByFechas= async ( organization: string, tipoFondo: string) => { //tipoFondo=1 es NORMAL
    const ingresos= await dbCartera.getAllIngresos( organization );//lee todos los ingresos
    const ingresosResumen= ingresos.map( ( {casa , documento, tipoMovimiento, createdAt, updatedAt, fechaDocumento, ...i} ) => {
        const { tipoDocumento, nroDocumento, comentario:comentarioDoc, familiaName } = documento;
        const idMovimiento= i._id;
        const { codigo: codigoCasa } = casa;
        const { ingresoSalda } = tipoMovimiento;
        const comentario = ( tipoDocumento === 'INGRESO' && casa.codigo !== 'TODAS' ) 
                 ?'Casa '+ codigoCasa+', '+familiaName 
                 : comentarioDoc;
        const tipoFondo= ( ingresoSalda === 1000 ) ? 'NORMAL': 'EMERGENCIA';                 
        const ingreso = ( i.monto>=0 ) ? i.monto : 0;
        const gasto= ( i.monto<0 ) ?i.monto : 0; 
        return { idMovimiento, tipoDocumento, nroDocumento, fechaDocumento, comentario, tipoFondo, ingresoSalda, 
             ingreso, gasto , saldo: 0, codigoCasa}
    });
    const gastos= await dbCartera.getAllGastos( organization );//lee todos los gastos
    const gastosResumen = gastos.map( ( { documento, tipoMovimiento, createdAt, updatedAt, fechaDocumento, ...i } ) => {
        const { tipoDocumento, nroDocumento, comentario:comentarioDoc  } = documento;
        const idMovimiento= i._id;
        const { idTipoMovimiento, name: nameTipoMovimiento, ingresoSalda} = tipoMovimiento;
        const comentario= ( tipoDocumento === 'GASTO' && idTipoMovimiento !== 98 )
                ? nameTipoMovimiento+'...'+ (comentarioDoc.length>0 ?comentarioDoc : '')
                : comentarioDoc;
        const tipoFondo= ( ingresoSalda === 1000 ) ? 'NORMAL': 'EMERGENCIA';                 
        const ingreso=( i.monto<0 ) ? i.monto : 0; 
        const gasto=( i.monto>=0 ) ? i.monto : 0 
        return { idMovimiento, tipoDocumento, nroDocumento, fechaDocumento, comentario, tipoFondo, ingresoSalda, 
            ingreso, gasto , saldo: 0, codigoCasa:'TODAS' }
    });
    const movtos= [...ingresosResumen, ...gastosResumen];
    const movtoOrdenados= movtos.filter( mov => mov.tipoFondo === tipoFondo)
                    .sort((a, b) => a.fechaDocumento.localeCompare(b.fechaDocumento));
    let saldoAnt=0;                    
    const movtosConSaldo = movtoOrdenados.map( ({ saldo, ingreso, gasto, ingresoSalda, tipoDocumento, ...m },index ) =>{
        const newSaldo = ( tipoDocumento === 'INGRESO') ? saldoAnt + ingreso : saldoAnt - gasto;
        saldoAnt = newSaldo;
        return  {...m,tipoDocumento,saldo: newSaldo, ingreso, gasto, ingresoSalda, id: index }
    } );                    
    return JSON.parse(JSON.stringify(movtosConSaldo));
   
} 
 export const getCartolaByCasa=async ( organization: string, casa: string, fechaDesde: string, fechaHasta: string) =>{
     const doctos= await dbCartera.getCarteraByCasa( organization, casa );//lee todos los ingresos de un casa entre fechas
     const ingresosResumen= doctos.filter( li => moment(li.fechaDocumento).format('YYYYMMDD') >= moment( fechaDesde ).format('YYYYMMDD') 
     &&  moment(li.fechaDocumento).format('YYYYMMDD') <= moment( fechaHasta ).format('YYYYMMDD') ) 
        .map( ( {casa , documento, tipoMovimiento, createdAt, updatedAt, fechaDocumento, mesPago, monto, ...i} ) => {
            const { tipoDocumento, nroDocumento, comentario:comentarioDoc, familiaName } = documento;   
            const id= i._id;
            const { codigo: codigoCasa } = casa;
            const { name: nameMovimiento,ingresoSalda } = tipoMovimiento;       
            const comentario =  'Casa '+ codigoCasa+', '+familiaName+' ...' + comentarioDoc;
        return { id, tipoDocumento, nroDocumento, fechaDocumento , comentario, familiaName, nameMovimiento, mesPago, monto, codigoCasa }
    });   
    return JSON.parse(JSON.stringify( ingresosResumen ));
 }
 export const getMovIngresosAll= async ( organization: string, tipoMov: string) => { 
    const ingresos= await dbCartera.getAllIngresos( organization );//lee todos los ingresos existentes
    
    const ingresosResumen= ingresos.map( ( {casa , documento, tipoMovimiento, createdAt, updatedAt, fechaDocumento, monto, mesPago, ...i} ) => {
        const { tipoDocumento, nroDocumento, comentario:comentarioDoc, familiaName } = documento;
        const idMovimiento= i._id;
        const { codigo: codigoCasa } = casa;
        const { ingresoSalda, name: nameMovimiento , idTipoMovimiento } = tipoMovimiento;
        const comentario = ( tipoDocumento === 'INGRESO' && casa.codigo !== 'TODAS' ) 
                 ?'Casa '+ codigoCasa+', '+familiaName 
                 : comentarioDoc;
        const tipoFondo= ( ingresoSalda === 1000 ) ? 'NORMAL': 'EMERGENCIA';                 
        return { idMovimiento, tipoDocumento, nroDocumento, fechaDocumento, mesPago , comentario, tipoFondo, ingresoSalda, 
             monto, codigoCasa ,nameMovimiento, idTipoMovimiento }
    }).filter(mo =>  ( (tipoMov === 'INGRESO_NORMAL' && mo.ingresoSalda ===  1000) || (tipoMov === 'INGRESO_EMERGENCIA' && mo.ingresoSalda ===  1001)
            || (tipoMov === 'INGRESO_TOTAL' ))); 
    //console.log('ingresosResumen',tipoMov,ingresosResumen.filter( x => x.codigoCasa === 'A' ))
    let newArr = [{ codigoCasa: '',annoMes: 0,totalMes: 0, comentario: '', keyGroupBy:'',keyRow:'', nameMovimiento:'' }];
    ingresosResumen.forEach(( { codigoCasa, mesPago, comentario, nameMovimiento, idTipoMovimiento }) =>{
       const founds = ingresosResumen.filter( x => x.codigoCasa === codigoCasa && x.mesPago === mesPago );
       if ( founds ){ 
        const totalMes = founds.reduce((total, mv) => total + mv.monto, 0);
        const keyGroupBy=  ( tipoMov === 'INGRESO_TOTAL' ) ? codigoCasa + mesPago?.toString() :codigoCasa + mesPago?.toString()+ idTipoMovimiento.toString();
        const descripcionMov=  ( tipoMov === 'INGRESO_TOTAL' ) ? 'Ingresos totales' :nameMovimiento;
        const annoMes= mesPago || 0;
        const keyRow= annoMes.toString().substring(0,4)+'-'+codigoCasa; //fila única par armar el pivot
        const ifFound= newArr.find( n => n.keyGroupBy === keyGroupBy ); 
        if ( !ifFound ) {
             newArr=[...newArr, {codigoCasa, annoMes, totalMes, comentario, keyGroupBy, keyRow, nameMovimiento: descripcionMov }]
        };
       }
    });    
    
    const ingresosxCasa= newArr.sort((a, b) => a.keyGroupBy.localeCompare(b.keyGroupBy))
                               .filter(z => z.codigoCasa !== '');  
    // if ( tipoMov === 'INGRESO_EMERGENCIA' )console.log('ingresosxCasa:',tipoMov,ingresosxCasa.filter( x => x.codigoCasa === 'A' )) 
    // if ( tipoMov === 'INGRESO_NORMAL' )console.log('ingresosxCasa:',tipoMov,ingresosxCasa.filter( x => x.codigoCasa === 'A' )) 
    // if ( tipoMov === 'INGRESO_TOTAL' )console.log('ingresosxCasa:',tipoMov,ingresosxCasa.filter( x => x.codigoCasa === 'A' )) 
    return JSON.parse(JSON.stringify( ingresosxCasa ));
}

export const getMovGastosAll= async ( organization: string, tipoMov: string) => { 
    const gastosCartera= await dbCartera.getAllGastos( organization );
    const gastos=gastosCartera.filter( gg  => gg.entradaSalida === 'E');//solo los gastos
    //if (tipoMov === 'GASTO_NORMAL') console.log('gastos normales ',gastos)
    const gastosResumen= gastos.map( ( { documento, tipoMovimiento, createdAt, updatedAt, fechaDocumento, monto,  ...i} ) => {
        const { tipoDocumento, nroDocumento, comentario:comentarioDoc } = documento;
        const idMovimiento= i._id;
        const { ingresoSalda, name: nameMovimiento , idTipoMovimiento } = tipoMovimiento;
        const annoMes=  parseInt( moment(fechaDocumento).format('YYYYMM'));
        const comentario = ( tipoDocumento === 'GASTO' && ingresoSalda === 1000 )  ? nameMovimiento  : comentarioDoc;
        const tipoFondo= ( ingresoSalda === 1000 ) ? 'NORMAL': 'EMERGENCIA';                 
        return { idMovimiento, tipoDocumento, nroDocumento, fechaDocumento, annoMes , comentario, tipoFondo, ingresoSalda, 
             monto, nameMovimiento, idTipoMovimiento }
    }).filter(mo =>  ( (tipoMov === 'GASTO_NORMAL' && mo.ingresoSalda ===  1000) || (tipoMov === 'GASTO_EMERGENCIA' && mo.ingresoSalda ===  1001)
            || (tipoMov === 'GASTO_TOTAL' ))); 
    //  console.log('gastosResumen',gastosResumen.filter( g => g.comentario.length === 0))       
    let newArr = [{idTipoMovimiento: -1, annoMes: 0,totalMes: 0, comentario: '', keyGroupBy:'',keyRow:'', nameMovimiento:'' }];
    gastosResumen.forEach(( { annoMes, comentario, nameMovimiento, idTipoMovimiento, nroDocumento }) =>{
       const founds = gastosResumen.filter( x => x.idTipoMovimiento === idTipoMovimiento && x.annoMes === annoMes );
       if ( founds ){ 
        const totalMes = founds.reduce((total, mv) => total + mv.monto, 0);
        const keyGroupBy=  ( tipoMov === 'GASTO_TOTAL' ) ? idTipoMovimiento.toString() + annoMes?.toString() :idTipoMovimiento.toString()+ annoMes?.toString();
        const descripcionMov=  ( tipoMov === 'GASTO_TOTAL' ) ? 'Gastos totales' :nameMovimiento;
        const nroDoc= ( idTipoMovimiento === 99 )? '-' + nroDocumento.toString():''; //para diferenciar a los gastos extra
        const keyRow= Math.floor(annoMes/100).toString() + '-' + idTipoMovimiento.toString() +nroDoc  ; //fila única par armar el pivot
        const ifFound= newArr.find( n => n.keyGroupBy === keyGroupBy );
        //const ifFound= newArr.find( n => n.keyRow === keyRow );
        if ( !ifFound ) {
            newArr=[...newArr, {idTipoMovimiento, annoMes, totalMes, comentario, keyGroupBy, keyRow, nameMovimiento: descripcionMov }]
        };
       }
    });   
    const gastosxTipo= newArr.sort((a, b) => a.keyGroupBy.localeCompare(b.keyGroupBy)).filter(z => z.idTipoMovimiento !== -1);  
    //const gastosxTipo= newArr.sort((a, b) => a.keyRow.localeCompare(b.keyRow)).filter(z => z.idTipoMovimiento !== -1);  
    // if ( tipoMov === 'INGRESO_EMERGENCIA' )console.log('ingresosxCasa:',tipoMov,ingresosxCasa.filter( x => x.codigoCasa === 'A' )) 
     //if ( tipoMov === 'GASTO_NORMAL' ) console.log('gastosxTipo:',tipoMov,gastosxTipo) 
    // if ( tipoMov === 'INGRESO_TOTAL' )console.log('ingresosxCasa:',tipoMov,ingresosxCasa.filter( x => x.codigoCasa === 'A' )) 
    return JSON.parse(JSON.stringify( gastosxTipo ));
}
