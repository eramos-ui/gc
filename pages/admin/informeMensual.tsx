import { ChangeEvent, PropsWithChildren, useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useExcelDownloder } from 'react-xls';
import moment from "moment";

import { Box, Button, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { DashboardOutlined } from '@mui/icons-material';
import Pagination from "@mui/material/Pagination";
import { DataGrid, GridColDef, useGridApiContext, useGridSelector, gridPageCountSelector, gridPageSelector } from '@mui/x-data-grid';

import { dbCartola } from '../../database';
import { PpalLayout } from '../../components/layouts';
import { FullScreenLoading } from '../../components/ui';
import { currency, arrayFunctions, dateFunction } from "../../utils";

const meses = [
  { value: '202201',  label: 'Enero' }, { value: '202202', label: 'Febrero' },{ value: '202203', label: 'Marzo' }, { value: '202204', label: 'Abril' },
  { value: '202205', label: 'Mayo' }, { value: '202206',  label: 'Junio'}, { value: '202207', label: 'Julio' }, {  value: '202208', label: 'Agosto' },
  { value: '202209', label: 'Septiembre' }, { value: '202210',  label: 'Octubre' },{ value: '202211', label: 'Noviembre' },{ value: '202212', label: 'Diciembre' },
];

let columns: GridColDef[] = [
  { field: 'comentario', headerName: 'Descripción', width: 320 },
  { field: meses[0].value, headerName: meses[0].label, width:  85 },
  { field: meses[1].value, headerName: meses[1].label, width:  85 },
  { field: meses[2].value, headerName: meses[2].label, width:  85 },
  { field: meses[3].value, headerName: meses[3].label, width:  85 },
  { field: meses[4].value, headerName: meses[4].label, width:  85 },
  { field: meses[5].value, headerName: meses[5].label, width:  85 },
  { field: meses[6].value, headerName: meses[6].label, width:  85 },
  { field: meses[7].value, headerName: meses[7].label, width:  85 },
  { field: meses[8].value, headerName: meses[8].label, width:  85 },
  { field: meses[9].value, headerName: meses[9].label, width:  85 },
  { field: meses[10].value, headerName: meses[10].label, width:85 },
  { field: meses[11].value, headerName: meses[11].label, width:85 },
];
const tipoMovs = [ { value: 'NADA', label: 'Sin seleccionar' }, { value: 'INGRESO_NORMAL', label: 'Ingreso fondo Normal' }, 
 { value: 'INGRESO_EMERGENCIA', label: 'Ingreso fondo de Emergencia' }, { value: 'INGRESO_TOTAL', label: 'Ingresos totales' }
 , { value: 'GASTO_NORMAL', label: 'Gasto fondo Normal' }, { value: 'GASTO_EMERGENCIA', label: 'Gasto fondo de Emergencia' }, { value: 'GASTO_TOTAL', label: 'Gastos totales'  }
];
type tableAnnos = {
  value: number;
  label: string;
}
interface Props {
  ingresosPivot: any[];
  ingresosNormalPivot: any[];
  ingresosExtraPivot:any[];
  gastoNormalPivot:any[];
  gastosEmergenciaPivot:any[];
  gastosPivot:any[];
  annosExistentes: tableAnnos[];
  annoMeses: tableAnnos[];
}
const InformeMensual: React.FC<PropsWithChildren<Props>> = ({ ingresosPivot, ingresosNormalPivot, ingresosExtraPivot, 
     gastoNormalPivot, gastosEmergenciaPivot,gastosPivot, annosExistentes, annoMeses }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tipoMov, setTipoMov] = useState('NADA');
  const [annoSelected, setAnnoSelected] = useState<number>(0);
  const [ dataExcel, setDataExcel ] = useState({});
  const { ExcelDownloder, Type } = useExcelDownloder();

  useEffect(() => {
    (annosExistentes.length > 0) ? setIsLoading(false) : setIsLoading(true);
  }, [annosExistentes, setIsLoading])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTipoMov(event.target.value);
    setRows([]);
  };
  const handleChangeAnno = (event: ChangeEvent<HTMLInputElement>) => {
    setAnnoSelected(parseInt(event.target.value));
    setRows([]);
  };
  const CustomPagination = () => {
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
  const onConsulta = async () => {
    if (annoSelected === 0) {
      console.log('Falta seleccionar el año')
      return;
    }
    if (tipoMov === 'NADA') {
      console.log('Falta seleccionar tipo de Movimiento')
      return;
    }
    setIsLoading(true);

    const meses = annoMeses.map((m) => {
      return { value: m.value, label: m.label }
    })
    const movimientos = ( tipoMov === 'INGRESO_TOTAL' )? ingresosPivot: ( tipoMov === 'INGRESO_NORMAL' )
        ? ingresosNormalPivot: ( tipoMov === 'INGRESO_EMERGENCIA') ? ingresosExtraPivot
          :( tipoMov === 'GASTO_NORMAL') ? gastoNormalPivot : ( tipoMov === 'GASTO_EMERGENCIA') 
          ? gastosEmergenciaPivot:gastosPivot;
   
    const lines = movimientos.map((ing, idx) => {
      return { id: idx + 1, ...ing }
    }).filter( xx => xx.anno === annoSelected);
    //console.log('lines',lines)
    columns = [
      { field: 'comentario', headerName: ( tipoMov.includes('INGRESO')) ? 'Comunera/o': 'Descripción del gasto', width: 320 },
      { field: `${meses[0].value}`, headerName: `${meses[0].label}`, width:  85, sortable: false, align: 'right', valueGetter: ({ value }) => currency.format(value) },
      { field: `${meses[1].value}`, headerName: `${meses[1].label}`, width:  85, sortable: false, align: 'right', valueGetter: ({ value }) => currency.format(value) },
      { field: `${meses[2].value}`, headerName: `${meses[2].label}`, width:  85, sortable: false, align: 'right', valueGetter: ({ value }) => currency.format(value) },
      { field: `${meses[3].value}`, headerName: `${meses[3].label}`, width:  85, sortable: false, align: 'right', valueGetter: ({ value }) => currency.format(value) },
      { field: `${meses[4].value}`, headerName: `${meses[4].label}`, width:  85, sortable: false, align: 'right', valueGetter: ({ value }) => currency.format(value) },
      { field: `${meses[5].value}`, headerName: `${meses[5].label}`, width:  85, sortable: false, align: 'right', valueGetter: ({ value }) => currency.format(value) },
      { field: `${meses[6].value}`, headerName: `${meses[6].label}`, width:  85, sortable: false, align: 'right', valueGetter: ({ value }) => currency.format(value) },
      { field: `${meses[7].value}`, headerName: `${meses[7].label}`, width:  85, sortable: false, align: 'right', valueGetter: ({ value }) => currency.format(value) },
      { field: `${meses[8].value}`, headerName: `${meses[8].label}`, width:  85, sortable: false, align: 'right', valueGetter: ({ value }) => currency.format(value) },
      { field: `${meses[9].value}`, headerName: `${meses[9].label}`, width:  85, sortable: false, align: 'right', valueGetter: ({ value }) => currency.format(value) },
      { field: `${meses[10].value}`, headerName: `${meses[10].label}`, width:85, sortable: false, align: 'right', valueGetter: ({ value }) => currency.format(value) },
      { field: `${meses[11].value}`, headerName: `${meses[11].label}`, width:85, sortable: false, align: 'right', valueGetter: ({ value }) => currency.format(value) },
    ];
     if (lines.length>0){

       const hoja=lines.map( (  {comentario, ...i} ) =>{
              const entries=Object.entries(i).filter( z =>  (z[0] !=='anno' && z[0] !== 'keyRow'  && z[0] !== 'id')) ;
              const enero=entries[0][1];
              const febrero=entries[1][1];
              const marzo=entries[2][1];
              const abril=entries[3][1];
              const mayo=entries[4][1];
              const junio=entries[5][1];
              const julio=entries[6][1];
              const agosto=entries[7][1];
              const septiembre=entries[8][1];
              const octubre=entries[9][1];
              const noviembre=entries[10][1];
              const diciembre=entries[11][1];
             return  ( tipoMov.includes('INGRESO'))
            ?
              {
                Casa: comentario,
                enero, febrero, marzo, abril, mayo, junio,
                julio, agosto, septiembre, octubre, noviembre, diciembre
              }
            :
             {
              Gasto:comentario,
              enero, febrero, marzo, abril, mayo, junio,
              julio, agosto, septiembre, octubre, noviembre, diciembre
             }
       })
       setDataExcel((tipoMov === 'INGRESO_NORMAL') ? { IngresoNormal: hoja } :
                (tipoMov === 'INGRESO_EMERGENCIA') ? { IngresoEmergencia: hoja } :
                (tipoMov === 'INGRESO_TOTAL') ? { IngresoTotal: hoja } :
                (tipoMov === 'GASTO_NORMAL') ? { GastoNormal: hoja } :
                (tipoMov === 'GASTO_EMERGENCIA') ? { GastoEmergencia: hoja } :{ GastoTotal: hoja } 
       );
        setRows( lines );
      }
    setIsLoading(false);
  }

  return (
    isLoading
      ?
      (
        (<FullScreenLoading />)
      )
      :
      (
        <PpalLayout title='informe mensual' pageDescription='Informe mensual del año' >
          <Box display='flex' alignItems='center' justifyContent='center'
          >
            <Grid container spacing={1} >
              <TextField
                id="outlined-select-anno"
                sx={{ ml: 1, mt: 1, width: '165px' }}
                select
                label="Año"
                value={annoSelected}
                onChange={handleChangeAnno}
                helperText="Elija el año"
              >
                {
                  annosExistentes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
              </TextField>

              <TextField
                id="outlined-select-tipomovimiento"
                sx={{ ml: 1, mt: 1, width: '250px' }}
                select
                label="Tipo de movimiento"
                value={tipoMov}
                onChange={handleChange}
                helperText="Elija tipo de movimientos"
              >
                {
                  tipoMovs.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
              </TextField>
              <Button
                sx={{ ml: 1, mt: 1, width: '165px', height: '55px', backgroundColor: '#3A64D8', color: 'white' }}
                startIcon={<DashboardOutlined />}
                className='circular-btn'
                disabled={isLoading}
                onClick={onConsulta}
              >
                Consultar
              </Button>
            </Grid>
          </Box>
          {isLoading
            ? (<FullScreenLoading />)
            : (
              <>
                <Typography variant='h1' component='h1'>Informe mensual  </Typography>
                <Grid container className='fadeIn'>
                  <Grid item xs={12} sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                      pagination
                      components={{ Pagination: CustomPagination }}
                      disableColumnFilter
                      rows={rows}
                      columns={columns}
                      pageSize={10}
                      rowsPerPageOptions={[10]}
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
                filename={ `Fondo ${tipoMov}` }
                type={Type.Button} // or type={'button'}
              >
                {`Descargar a Excel Fondo ${tipoMov}`}
              </ExcelDownloder>
              )
              :(<></>)
           }
          </div>
        </PpalLayout>
      )
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });
  if (!session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      }
    }
  }
  const { user } = session;
  const { organization = 'undefined' } = user as any;
  if (!organization) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      }
    }
  }
  const ingresos = await dbCartola.getMovIngresosAll(organization, 'INGRESO_TOTAL');//son únicos por casa - mesAnno
  const listAnnos = ingresos.map(({ annoMes }: { annoMes: number }) => {
    const year = Math.floor(annoMes / 100)
    return year
  });
  let soloAnnos = arrayFunctions.distinct(listAnnos);//los años que hay en los datos

  const anns = soloAnnos.map(anno => {
    return (ingresos.find(({ annoMes }: { annoMes: number }) => annoMes === anno * 100 + 1)) ? anno : null;
  });
  const annoConDatos = anns.filter(x => x !== null);
  let meses = new Array();
  annoConDatos.forEach(anno => {//para definir las columnas de la matriz
    let anMes = new Array();
    for (let i = 1; i < 13; i++) {
      anMes = [...anMes, (anno * 100 + i)];
    }
    meses = [...meses, ...anMes]
  });
  let annos = [{ value: 0, label: 'Sin seleccionar' }];//para el select
  annoConDatos.forEach((year: number) => {
    annos = [...annos, { value: year, label: 'Año ' + year.toString() }];
  });  
  const annosExistentes = annos.sort((a, b) => a.value - b.value);
  const cc = ingresos.map(({ codigoCasa }: { codigoCasa: string }) => {// las filas de la matriz
    return codigoCasa;
  })
  const casas = arrayFunctions.distinct(cc);
  const annoMeses = meses.map((annoMes) => { //cambia annoMes por value, label en la titulo de la columnas
    const mes = annoMes - Math.floor(annoMes / 100) * 100;
    const label = dateFunction.months[mes - 1];//+' '+ Math.floor(annoMes/100);
    const annoMesString = annoMes.toString();
    return { value: annoMesString, label }
  });
  const mesMin=Math.min.apply(Math, annoConDatos).toString()+'-01'; 
  const mesMax=Math.max.apply(Math, annoConDatos).toString()+'-12'; 
  const ingresoPivoteTodos=arrayFunctions.getPivoteMulti( { array: ingresos, rows: [ 'keyRow','comentario' ], cols: 'annoMes', data: 'totalMes' } )
      .map( (x: any) => { const anno= parseInt(x.keyRow.substring(0,4)); return { ...x,anno } } );//se agrega anno para filtrar
  const ingresosPivot = arrayFunctions.addDateCols({start: mesMin, end: mesMax, dataFill: 0, array: ingresoPivoteTodos })

  const ingresosNormal = await dbCartola.getMovIngresosAll(organization, 'INGRESO_NORMAL');  
  const ingresoNormalPivote=arrayFunctions.getPivoteMulti( { array: ingresosNormal, rows: [ 'keyRow','comentario' ], cols: 'annoMes', data: 'totalMes' } )
      .map( (x: any) => { const anno= parseInt(x.keyRow.substring(0,4)); return { ...x,anno } } );//se agrega anno para filtrar
  const ingresosNormalPivot = arrayFunctions.addDateCols({start: mesMin, end: mesMax, dataFill: 0, array: ingresoNormalPivote });

  const ingresosExtra = await dbCartola.getMovIngresosAll(organization, 'INGRESO_EMERGENCIA');  
  const ingresoExtraPivote=arrayFunctions.getPivoteMulti( { array: ingresosExtra, rows: [ 'keyRow','comentario' ], cols: 'annoMes', data: 'totalMes' } )
      .map( (x: any) => { const anno= parseInt(x.keyRow.substring(0,4)); return { ...x,anno } } );//se agrega anno para filtrar
  const ingresosExtraPivot = arrayFunctions.addDateCols({start: mesMin, end: mesMax, dataFill: 0, array: ingresoExtraPivote });

  const gastosNormal = await dbCartola.getMovGastosAll(organization, 'GASTO_NORMAL');  
  const gastosNormalPivote	= arrayFunctions.getPivoteMulti( { array: gastosNormal, rows: ['keyRow','comentario'], cols: 'annoMes', data: 'totalMes' } )
      .map( (x: any) => { const anno= parseInt(x.keyRow.substring(0,4)); return { ...x,anno } } );//se agrega anno para filtrar
  const gastosNormalPivoteRellenada	= arrayFunctions.addDateCols({start: mesMin, end: mesMax, dataFill: 0, array: gastosNormalPivote });
  const gastoNormalPivot = arrayFunctions.addDateCols({start: mesMin, end: mesMax, dataFill: 0, array: gastosNormalPivoteRellenada });


  const gastosEmergencia = await dbCartola.getMovGastosAll(organization, 'GASTO_EMERGENCIA');  
  const gastosEmergenciaPivote = arrayFunctions.getPivoteMulti( { array: gastosEmergencia, rows: ['keyRow','comentario'], cols: 'annoMes', data: 'totalMes' } )
      .map( (x: any) => { const anno= parseInt(x.keyRow.substring(0,4)); return { ...x,anno } } );//se agrega anno para filtrar
  const gastosEmergenciaPivoteRellenada	= arrayFunctions.addDateCols({start: mesMin, end: mesMax, dataFill: 0, array: gastosEmergenciaPivote });
  const gastosEmergenciaPivot = arrayFunctions.addDateCols({start: mesMin, end: mesMax, dataFill: 0, array: gastosEmergenciaPivoteRellenada });

  const gastos = await dbCartola.getMovGastosAll(organization, 'GASTO_TOTAL');   
  const gastosPivote = arrayFunctions.getPivoteMulti( { array: gastos, rows: ['keyRow','comentario'], cols: 'annoMes', data: 'totalMes' } )
      .map( (x: any) => { const anno= parseInt(x.keyRow.substring(0,4)); return { ...x,anno } } );//se agrega anno para filtrar
  const gastosPivoteRellenada	= arrayFunctions.addDateCols({start: mesMin, end: mesMax, dataFill: 0, array: gastosPivote });
  const gastosPivot = arrayFunctions.addDateCols({start: mesMin, end: mesMax, dataFill: 0, array: gastosPivoteRellenada });

  return {
    props: {
      ingresosPivot,
      ingresosNormalPivot,
      ingresosExtraPivot,
      gastoNormalPivot,
      gastosEmergenciaPivot,
      gastosPivot,
      annosExistentes,
      annoMeses
    }
  }
}
/*
        const filasExcel=lines.map( ( { comentario,...i }) =>{
           const entries=Object.entries(i);
           const keys=Object.keys(i).filter( z =>  (z !=='anno' && z !== 'keyRow'  && z.substring(0,4) === annoSelected.toString() ) );
           const meses= keys.reduce ((acum: any, col: any) => {// col tiene los annoMes
             const ff= entries.find( (i:any) => i[0] === col ); //ff,[0] es el annoMes y ff:[1] el valor
             return { ...acum, [col]: ff?.[1] } }
            ,{});
            return {...meses , comentario} ; 
       });
*/       
export default InformeMensual;