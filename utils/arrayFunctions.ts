import { dateFunction } from ".";



export const distinct = ( array: any[] ) => ( [...new Set(array)]  );


  type pivoteProps = {
    array: any[];
    rows: string;
    cols: string;
    data: any;
  }
  type addDataColsProps = {
      start: 		string;
      end: 		string;
      dataFill:   number;
      array: 		{}[];
    }
    
    export const addDateCols = ( {start, end, dataFill, array}: addDataColsProps  ) => {
      const [startDate, endDate] = [ dateFunction.getDateFromYYYYMM(start), dateFunction.getDateFromYYYYMM(end) ];
      let fechas = [];
      for (let i = startDate; i<= endDate; i = dateFunction.addMonth(i) ) { fechas.push( dateFunction.getYYYYMMFromDate(i) ) };
      const objetoFill = fechas.reduce( (acum: any, col: any ) => ({ ...acum, [col]: dataFill }), {} ); 
      return array.map( (row: any) => ( { ...objetoFill, ...row }  ) );
    };
    //getDistinctKeysFromArray recibe el array y la llave que devuelve sin repetir
    export const getDistinctKeysFromArray = ( array: any[], key: string) => {
        const valueArray = array.map( i => i[key]  );//valueArray es un array con sólo las llaves 
        return [ ...new Set(valueArray) ]; //devuelve el array sin repeticiones 
    }
    export const getDistinctMultiKeysFromArray = ( array: any[], keys: any) => {
        
        //const keyMulti= keys[0]+'|||'+keys[1];
        
        //const valueArrayMulti= array.map( i =>  ) 
        //console.log('keys',keys,keyMulti ,valueArrayMulti)
        const key=keys[0];
        const valueArray = array.map( i => i[key]  );//valueArray es un array con sólo las llaves 
        return [ ...new Set(valueArray) ]; //devuelve el array sin repeticiones 
    }

    //Funciones Tabla Pivote  
    export const getPivote = ( {array, rows, cols, data}: pivoteProps ) => {
    //if (array[0].nameMovimiento === 'Ingresos totales')  console.log('getPivote-rows',rows )
    const listaRows = getDistinctKeysFromArray( array, rows ).sort();//el arreglo de las llaves ordenadas, son las rows de la 1era columna
    //if (array[0].nameMovimiento === 'Ingresos totales')  console.log('getPivote-array',listaRows )
    return listaRows.map( row => {//por cada row que va fija en la salida
        const rowArray 	= array.filter( (i: any) => i[rows] == row );//todas las filas que tienen la row fija
        const listaCols = getDistinctKeysFromArray( rowArray, cols ).sort();//array con las columnas diferentes (distinct) para cada row
        //el objeto en el reduce genera el atributo-valor siendo el atributo la columna 
        const objeto = listaCols.reduce( (acum: any, col: any) =>  ( { ...acum, [col]: (rowArray.find( (i: any) => i[cols] == col ) as any)[data] } ), {} );
        return { [rows]: row,...objeto };
    });
};

type pivoteMultiProps = {
    array: any[];
    rows:  any[];
    cols:  string;
    data:  any;
}

//getPivoteMulti( { array: ingresos, rows: ['comentario', 'codigoCasa'], cols: 'annoMes', data: 'totalMes' } );
/*
export const getPivoteMulti = ( {array, rows, cols, data}: pivoteMultiProps ) => {
    //console.log('rows',rows);
    const listaRows = getDistinctMultiKeysFromArray( array, rows ).sort();
    // const listaRowsArr = array.map (( i: any) => {
    //     return { [rows[0]]:i[rows[0]],[rows[1]]:i[rows[1]]}
    // } )
    //console.log('listaRowsArr',listaRowsArr) 
    const listaRowsTemp: any[] = listaRows.map( row => {
        const rowArray 	= array.filter( (i: any) => i[rows[0]] == row );
        
        const listaCols = getDistinctKeysFromArray( rowArray, cols ).sort();
        const objeto = listaCols.reduce( (acum: any, col: any) =>  ( { ...acum, [col]: (rowArray.find( (i: any) => i[cols] == col ) as any)[data] } ), {} );
        return { [rows[0]]: row,...objeto };
    });
    
    return rows.reduce( (acum: any, aditionalField: any) => {
      const added: any = listaRowsTemp.map( (row_: any) => {
        const encuentraObjeto: any = array.find( (a: any) => a[rows[0]] == row_[rows[0]] );
          return { ...row_, [aditionalField]: encuentraObjeto[aditionalField] }  
      });        
      return [...acum, ...added] }, [])
  };
  */
  export const getPivoteMulti = ( {array, rows, cols, data}: pivoteMultiProps ) => {
  
    const listaRows = getDistinctKeysFromArray( array, rows[0] ).sort();
    
    const listaRowsTemp: any[] = listaRows.map( row => {
      
        const rowArray 	= array.filter( (i: any) => i[rows[0]] == row )
        const listaCols = getDistinctKeysFromArray( rowArray, cols ).sort();
      
        const objeto = listaCols.reduce( (acum: any, col: any) =>  ( { ...acum, [col]: (rowArray.find( (i: any) => i[cols] == col ) as any)[data] } ), {} );
      
      
        return { [rows[0]]: row,...objeto };
    });
    
    return rows.reduce( (acum: any, aditionalField: any ): string[] => {
      const added: any = listaRowsTemp.map( (row_: any) => {
        const encuentraObjeto: any = array.find( (a: any) => a[rows[0]] == row_[rows[0]] );
        return { ...row_, [aditionalField]: encuentraObjeto[aditionalField] }  
      });        
      return [acum,...added] }, []).slice(1)
  };
  
/* la fila: const objeto = listaCols.reduce( (acum: any, col: any) =>  ( { ...acum, [col]: (rowArray.find( (i: any) => i[cols] == col ) as any)[data] } ), {} );
        const objeto = listaCols.reduce( (acum: any, col: any) => { 
          const totalObjeto = rowArray.find( (i: any) => i[cols] == col );
          const total = totalObjeto[data];
           return { 
              ...acum, 
              [col]: total
            } 
           } 
          , {} );

*/          