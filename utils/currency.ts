
export const format = ( value: number ) => {
    const formatter = new  Intl.NumberFormat('es-CL',
     { currency: "CLP", 
       style: "currency", 
     //   minimumFractionDigits: 2 , 
     //   maximumSignificantDigits: 2, 
     }
    )  
    return formatter.format( value );
 }