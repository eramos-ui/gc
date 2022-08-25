import {addMonths, format} from 'date-fns';
export const getDateFromYYYYMM = ( (YYYYMM: string)  => { 
    const cleanDate = YYYYMM.replace('-', '').replace('/', '');
    const [year, month, day] = [ parseInt(cleanDate.substring(0,4)), parseInt(cleanDate.substring(4,6)), 1 ]
    return new Date(year, month-1, day )
  })
export  const getYYYYMMFromDate = ( (date: Date) => ( format( date, 'yyyyMM') ));
export   const addMonth = (  (date: Date)  => ( addMonths( date, 1) ) );


export const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  