import { ChangeEvent, PropsWithChildren, useState } from 'react';
import NextLink from 'next/link';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useExcelDownloder } from 'react-xls';
import moment from "moment";

import { currency } from "../../utils";
import { Box, Button,  Grid, MenuItem,  TextField, Link, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridValueGetterParams,  useGridApiContext, useGridSelector ,  gridPageCountSelector,  gridPageSelector, } from '@mui/x-data-grid';
import Pagination from "@mui/material/Pagination";
import { DashboardOutlined } from '@mui/icons-material';

import { PpalLayout } from '../../components/layouts';
import { dbCartola } from '../../database';
import { FullScreenLoading } from '../../components/ui';

const tipoFondos = [
    {
        value: 'NADA',
        label: 'Sin seleccionar',
      },
    {
      value: 'NORMAL',
      label: 'Normal',
    },
    {
      value: 'EMERGENCIA',
      label: 'Emergencia',
    }
  ];
type grid= {
  idMovimiento:string;
  tipoDocumento: string;
  nroDocumento: number;
  fechaDocumento: string;
  comentario: string;
  tipoFondo: string;
  saldo: number;
  ingreso: number;
  gasto: number;
  ingresoSalda: number;
  codigoCasa: string;
}
interface Props {
  movtosNormal: grid[];
  movtosEmergencia: grid[];
}
const columns: GridColDef[] = [
  { field: 'fechaDocumento', headerName: 'Fecha', width: 100, sortable: false,valueGetter: ({ value }) => moment(value).format('DD-MM-YYYY')}, 
  { field: 'comentario', headerName: 'Descripción', width: 400, sortable: false },
  { field: 'ingreso', headerName: 'Ingreso', width: 100 , sortable: false, align: 'right',valueGetter: ({ value }) => currency.format (value)}, 
  { field: 'gasto', headerName: 'Gasto', width: 100 , sortable: false, align: 'right',valueGetter: ({ value }) => currency.format (value)}, 
  { field: 'saldo', headerName: 'Saldo', width: 100 , sortable: false, align: 'right',valueGetter: ({ value }) => currency.format (value)}, 
  {
        field: 'idMovimiento',
        headerName: 'Detalle por casa',
        width: 200,
        sortable: false,
        renderCell: (params: GridValueGetterParams) => {
            return (
               ( params.row.codigoCasa !=='TODAS' ) &&
               <NextLink href={`/admin/${ params.row.idMovimiento }  `} passHref>
                    <Link underline='always'>
                        Ver detalle
                    </Link>
               </NextLink>
            )
        }
   }  
];

const CartolaEntreFechas : React.FC<PropsWithChildren<Props>> = ( { movtosNormal, movtosEmergencia}) => {
    const [rows, setRows] = useState<grid[]>([]);
    const [isLoading, setIsLoading] = useState( false );
    const [fechaDesdeValue, setFechaDesdeValue] = useState<Date | string>( new Date().getFullYear()+'-01-01' );
    const [fechaHastaValue, setFechaHastaValue] = useState<Date | string>(moment().format('YYYY-MM-DD') );// 
    const [tipoFondo, setTipoFondo] = useState('NADA');
    const [ dataExcel, setDataExcel ] = useState({});
    const { ExcelDownloder, Type } = useExcelDownloder();
   
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTipoFondo(event.target.value);
        setRows([]);
    };
   const onConsulta= async (   ) =>{
      if ( moment( fechaDesdeValue ) > moment( fechaHastaValue ) ){
        console.log('Fecha desde debe ser menor a la fechas hasta') ;
        return; 
      } 
      if ( tipoFondo === 'NADA' ) {
        console.log('Falta seleccionar tipoFondo')  
        return;
      }
      setIsLoading( true);
      const movtos=(tipoFondo === 'NORMAL'  ) ? movtosNormal : movtosEmergencia;
      const lines  = movtos.filter( li => moment(li.fechaDocumento).format('YYYYMMDD') >= moment( fechaDesdeValue ).format('YYYYMMDD') 
            &&  moment(li.fechaDocumento).format('YYYYMMDD') <= moment( fechaHastaValue ).format('YYYYMMDD')  )
          .map( ({fechaDocumento, comentario, tipoFondo, tipoDocumento, nroDocumento, ingreso, gasto, 
                saldo, ingresoSalda, idMovimiento, codigoCasa}, idx) => {
             const idMovConFechas =idMovimiento+'--'+ fechaDesdeValue+'--'+ fechaHastaValue ; //se agrega fecha para pasar a la subconsulta    
            return {
              id: idx +1, fechaDocumento, comentario, tipoFondo, tipoDocumento, nroDocumento, ingreso, gasto, saldo, 
              ingresoSalda, idMovimiento: idMovConFechas, codigoCasa
            }
          }) ;
      if (lines.length>0){
         const { fechaDocumento, tipoFondo, tipoDocumento, nroDocumento, ingreso, gasto, saldo, 
          ingresoSalda, idMovimiento }= lines[0];
         const linesCon0  = [...lines, {id:0 , fechaDocumento, comentario:'Saldo anterior', tipoFondo, 
              tipoDocumento, nroDocumento, ingreso: 0, gasto:0, saldo:  saldo - ingreso + gasto , ingresoSalda, 
              idMovimiento, codigoCasa:'TODAS' }];            
         const lineacon0Ord = linesCon0.sort((a, b) => a.id - b.id )
         const hoja=lineacon0Ord.map( ( { fechaDocumento, comentario: Descripcion, ingreso: Ingresos, gasto: Gastos, saldo: Saldo,...i }) =>{
         return {
          Fecha: moment(fechaDocumento).format('YYYY-MM-DD'),
          Descripcion,
          Ingresos, 
          Gastos,
          Saldo
         }
        });
        setDataExcel( ( tipoFondo === 'NORMAL') ? { Fondo_Normal: hoja } :  { Fondo_Emergencia: hoja } );
        setRows( lineacon0Ord );
        setIsLoading( false);
    }
  }
  const  CustomPagination=() => {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  
    return (
      
      <Pagination
        color="primary"
        count={pageCount}
        page={page + 1}
        onChange={(event, value) => apiRef.current.setPage(value - 1)}
      />
    );
  }
  return (
    <PpalLayout title='movimientos entre fechas' pageDescription='Cartola entre fechas' >
        <Box display='flex' alignItems='center' justifyContent='center' 
        >
            <Grid container spacing= {1} >
                <TextField
                        sx={{ ml: 1, mt:1}}
                        label="Fecha desde"
                        type="date"
                        defaultValue={ fechaDesdeValue } //"2022-01-01"
                        onChange={(e) => {setFechaDesdeValue(e.target.value as string); setRows([]);}}
                        InputLabelProps={{
                        shrink: true,
                        }}
                    />
                <TextField
                        id="dateHasta"
                        label="Fecha hasta"
                        type="date"
                        
                        defaultValue={ fechaHastaValue } //"2022-07-24"
                        sx={{ ml: 1, mt:1}}
                        onChange={(e) => {setFechaHastaValue(e.target.value as string);setRows([]);}}
                        InputLabelProps={{
                        shrink: true,
                        }}
                    />
                <TextField
                    id="outlined-select-tipoFondo"
                    sx={{ ml: 1, mt:1 , width:'165px'}}
                    select
                    label="Tipo de fondo"
                    value={tipoFondo}
                    onChange={handleChange}
                    helperText="Elija tipo de fondo"
                    >
                    {
                        tipoFondos.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                    ))}
                  </TextField>
                  <Button 
                        sx={{ ml: 1, mt: 1, width: '165px', height:'55px', backgroundColor: '#3A64D8', color: 'white'}}        
                        startIcon={ <DashboardOutlined /> }
                        className='circular-btn' 
                        disabled = { isLoading }
                        onClick={ onConsulta }
                  >
                        Consultar
                  </Button>
            </Grid>
        </Box>
        { isLoading
          ? ( <FullScreenLoading /> )
          :(
            <>
              <Typography variant='h1' component='h1'>Cartola del fondo {tipoFondo!== 'NADA' ? tipoFondo : ''}</Typography>
                <Grid container className='fadeIn'>
                <Grid item xs={12} sx={{ height: 650, width: '100%' }}>
                      <DataGrid 
                          pagination
                          components={{  Pagination: CustomPagination   }}
                          disableColumnFilter 
                          rows={ rows }
                          columns={ columns }
                          pageSize={ 10 }
                          rowsPerPageOptions={ [10] }
                      />
                  </Grid>
                </Grid>
            </>
          )
        } 
        <div>
          {
            rows.length>0
            ?(
              <ExcelDownloder
                data={ dataExcel }
                filename={ `Fondo ${tipoFondo} ${moment(fechaDesdeValue).format('YYYY-MM-DD')} al ${moment(fechaHastaValue).format('YYYY-MM-DD')}` }
                type={Type.Button} // or type={'button'}
              >
                {`Descargar a Excel Fondo ${tipoFondo}`}
              </ExcelDownloder>
              ):
              <></>
          }
        </div>
    </PpalLayout>
  )
}
export const getServerSideProps: GetServerSideProps = async ({ req }) => {//302
    const session = await getSession( { req });
    if ( !session ){
        return {
           redirect: {
             destination: '/auth/login',
             permanent: false,
           }
        } 
     }
    const {user}= session;
    const {  organization = 'undefined' } = user as any;
    if ( !organization ){
        return {
            redirect: {
              destination: '/auth/login',
              permanent: false,
            }
         } 
    }
    const movtosNormal = await dbCartola.getCartolaByFechas( organization , 'NORMAL' );
    const movtosEmergencia = await dbCartola.getCartolaByFechas( organization , 'EMERGENCIA' );
    return {
        props: {
          movtosNormal,
          movtosEmergencia
        }
    }
  }
export default CartolaEntreFechas;