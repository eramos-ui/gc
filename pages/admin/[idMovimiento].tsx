import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';

import { Box, Grid,  Link,  Typography } from '@mui/material';
import { DataGrid, GridColDef,  useGridApiContext, useGridSelector ,  gridPageCountSelector,  gridPageSelector, } from '@mui/x-data-grid';
import Pagination from "@mui/material/Pagination";
import { useExcelDownloder } from 'react-xls';
import moment from "moment";

import { PpalLayout } from '../../components/layouts';
import { getCarteraGastoById, getCarteraIngresoById } from '../../database/dbCartera';
import { getCartolaByCasa } from '../../database/dbCartola';
import { currency } from "../../utils";
import { FullScreenLoading } from '../../components/ui';

type grid= {
    id?: string;    
    tipoDocumento: string;
    nroDocumento: number;
    fechaDocumento: string;
    comentario: string;
    familiaName: string;
    nameMovimiento: string;
    mesPago: number;
    monto: number; 
    codigoCasa: string;
}
interface Props {
    children?: React.ReactNode;
    movs: grid[];
    casa: string;
  }
  const columns: GridColDef[] = [
    { field: 'fechaDocumento', headerName: 'Fecha', width: 100, valueGetter: ({ value }) => moment(value).format('DD-MM-YYYY')}, 
    { field: 'comentario', headerName: 'Descripción', width: 400 },
    { field: 'nameMovimiento', headerName: 'Asignado a', width: 200 },
    { field: 'mesPago', headerName: 'Mes', width: 200,  valueGetter: ({ value }) => value.toString().substring(4,6)+'-'+value.toString().substring(0,4)  } ,
    { field: 'monto', headerName: 'Monto Ingreso', width: 120 ,  align: 'right' , sortable: false,valueGetter: ({ value }) => currency.format (value)}, 
  ];
const DetalleCasaPage : NextPage<Props> = ( { movs, casa } )  => {
    const router= useRouter();
    const [rows, setRows] = useState<grid[]>([]); 
    const [isLoading, setIsLoading] = useState( false );
    const [ dataExcel, setDataExcel ] = useState({});
    const { ExcelDownloder, Type } = useExcelDownloder();  
    useEffect(() => {
        setIsLoading( true);
        const hoja=movs.map( ( { fechaDocumento, comentario: Descripcion, monto: Monto,nameMovimiento:Asignado, mesPago }) =>{
            return {
            Fecha: moment(fechaDocumento).format('YYYY-MM-DD'),
            Descripcion,
            Asignado,
            MesPago: mesPago.toString().substring(4,6)+'-'+mesPago.toString().substring(0,4) , 
            Monto, 
            }
        });
        setDataExcel(  { Ingresos_casa: hoja });
        setRows( movs );
        setIsLoading( false);
    }, [movs, setDataExcel, setRows, setIsLoading])  
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
        <PpalLayout title='detalle por casa' pageDescription='Detalle de movimientos por casa' >
            { isLoading
              ? ( <FullScreenLoading /> )
              :(
                <>
                    <Box display= 'flex' flexDirection ='row' >
                        <Typography variant='h1' component='h1'>Ingresos de la casa {casa }  </Typography>
                        <NextLink 
                            href='/admin/cartolaEntreFechas'
                            passHref
                        >
                            <Link underline='always' sx={{ ml:6, mt:1 }} >
                               Regresar a consulta anterior
                            </Link>
                        </NextLink>
                    </Box>
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
                    filename={ `Ingresos casa ${casa}` }
                    type={Type.Button} 
                >
                     {`Descargar a Excel de Ingresos  Casa ${casa}`}
                </ExcelDownloder>
                ):
                <></>
             }
            </div>
        </PpalLayout>    
    )
}
export const getServerSideProps: GetServerSideProps = async ({ req, query}) => {
    const { idMovimiento= '' } = query;
    const elements=idMovimiento.toString().split("--");//viene el idMovimiento--fechaDesde--fechaHasta
    const idMov=elements[0];
    const fechaDesde=elements[1];
    const fechaHasta=elements[2];
    const { user }: any = await getSession( { req });
    if ( !user ){
        return {
            redirect: {
                destination: '/auth/login',
                permanent: false
            }
        }
    }
    const movimientoCartera= await getCarteraIngresoById( user.organization, idMov );
    const movimientoCarteraGasto= await getCarteraGastoById( user.organization, idMov );
    const movimiento=( !movimientoCartera )? movimientoCarteraGasto : movimientoCartera;
    const casa=movimiento.casa;
    const movs=await getCartolaByCasa( user.organization, casa, fechaDesde, fechaHasta )
    return {
        props: {
            movs,
            casa: movs[0].codigoCasa

        }
    }
}

export default DetalleCasaPage;