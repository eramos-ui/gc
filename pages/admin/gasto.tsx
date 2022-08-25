
import {  PropsWithChildren, useState, useEffect, forwardRef } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import moment from "moment";
import NumberFormat from "react-number-format";

import { Box, Button, Grid, MenuItem, TextField } from '@mui/material';

import { PpalLayout } from "../../components/layouts";
import { getAllGastos } from "../../database/dbGasto";
import { gcApi } from "../../api";
import { SaveOutlined } from "@mui/icons-material";
import { dbUsers } from '../../database';
import { IUser } from '../../interfaces';


type FormData = {
  gastoSelected: string;
  fechaPago: string;
  cifra: string;
  comentario: string;
  organization:string;
  userId:string;
};
interface Props {
  listGastos: any[];
  organization: string,
  user:IUser;
}

interface CustomProps {//https://codesandbox.io/s/5k8wm
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}
// interface State {
//   monto: number;
// }
const NumberFormatCustom = forwardRef<NumberFormat<any>, CustomProps>(
  function NumberFormatCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <NumberFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          // const { formattedValue, value } = values;
          // const { event, source } = sourceInfo;
          //console.log('values',values)
          onChange({
            target: {
              name: props.name,
              value: values.value,
            }
          });
        }}
        //thousandSeparator
        isNumericString
        //prefix={'$'}
        
        decimalScale={0}
        thousandSeparator={"."}
        decimalSeparator={","}

      />
    );
  }
);

const GastoPage : React.FC<PropsWithChildren<Props>> = ( { listGastos , organization, user }) => {
  const router= useRouter();
  const { register, handleSubmit, formState: { errors }, setValue, getValues } = useForm<FormData>(
        { defaultValues: { gastoSelected:listGastos[0].id, comentario:'', fechaPago: moment().format('yyyy-MM-DD'), cifra: '' } });
  const [isSaving, setIsSaving] = useState( false );
  const [ ingresoSalda, setIngresoSalda ] =useState( 1000);//para validar el ingreso del comentario
  // const [values, setValues] = useState<State>({
  //   monto: ""
  // });

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setValues({
  //     ...values,
  //     [event.target.name]: event.target.value
  //   });
  // };

  useEffect(() => {
    setValue('organization', organization); //agregada a valore del form 
    const {_id:userId } = user;
    setValue( 'userId', userId );//usuario que opera  
  }, [organization, user, setValue])
  const onSubmit = async ( form : FormData ) =>{//al monto hay que sacarle el prefix si tiene
    //console.log('onRegisterForm form',  form); 
    setIsSaving(true);
    try{
      const { data }= await gcApi({
            url: '/admin/registrarGasto',
            method: 'POST',//form._id ? 'PUT': 'POST',
            data: form
        });
        router.reload();//si todo está OK recarga la página 
     } catch (error){
      console.log(error)
      setIsSaving( false )
      return;
    }
   }
  return (
   <PpalLayout title='Ingresos' pageDescription='Registro de gasto'>
        <Box display='flex' justifyContent={'center'} sx={{ smb: 2 }}>
            <h3>Registro un gasto</h3>
        </Box>
        <form onSubmit={ handleSubmit ( onSubmit ) } noValidate
        >
           <Box sx={{ width: 300, padding: '10px 20px' }} >
            <Grid item xs={ 12 }>
              <TextField
                value={ getValues('gastoSelected') }
                onChange ={ (e) => { setValue('gastoSelected', e.target.value, { shouldValidate: true });
                                     setIngresoSalda( listGastos.find(c => c.id === getValues('gastoSelected') ).ingresoSalda  ) }}
                sx={{ ml: 1, mt: 1, width: '400px' }}
                select                
                label="Gasto al que registra"
                error= { !!errors.gastoSelected }
                helperText= { errors.gastoSelected?.message }
              >
                {
                  listGastos.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item xs={ 12 }>
              <TextField
                        sx={{ ml: 1, mt:3}}
                        label="Fecha de pago"
                        type="date"
                        { ...register('fechaPago', { 
                          required: 'Este campo es requerido',
                          })}
                        error= { !!errors.fechaPago }
                        helperText= { errors.fechaPago?.message }
                    />
            </Grid>
            <Grid item xs={ 12 }>
              <Grid item xs={ 12 }>
                <TextField
                    sx={{ maxWidth: 180, ml: 1, mt:3 }}
                    autoComplete='off'
                    label='Monto del gasto'
                    //value={values.numberformat}                
                    //onChange={ handleChange }
                    InputProps={{
                      inputComponent: NumberFormatCustom as any
                    }}
                    { ...register('cifra', { 
                      required: 'Este campo es requerido',
                      minLength: {value: 2 , message: 'Mínimo 2 dígitos'}
                      })}
                    error= { !!errors.cifra }
                    helperText= { errors.cifra?.message }
                  />
                  <TextField
                            type='text'
                            multiline
                            rows={3}
                            autoComplete='off'
                            sx={{ width: 400, ml: 1, mt:3}}
                            label='Comentario (mín. 10 caracteres.'
                            { ...register('comentario', {
                              validate: {
                                required: value => ( ingresoSalda !== 1000 && value.trim().length < 10 ) 
                                    ?  'Requerido para "Otros Gastos del fondo de emergencia"' 
                                    : undefined
                              },
                            })}
                            error= { !!errors.comentario }
                            helperText= { errors.comentario?.message }
                  />
              </Grid>
              <Button
                        type='submit'
                        startIcon={ <SaveOutlined /> }
                        sx={{ ml: 2, mt: 3, width: '165px', height:'55px', backgroundColor: '#3A64D8', color: 'white'}}        
                        className='circular-btn'
                        disabled = { isSaving } 
              >
                        Registrar gasto
                  </Button>
            </Grid>
          </Box>
        </form>
   </PpalLayout>
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
  const { user: userSession } = session;
  const { organization = 'undefined' } = userSession as any;
  if (!organization) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      }
    }
  }
  const email=userSession?.email;
  const user : any = await dbUsers.getUserByEmail( email || '' );
  const status='VIGENTES';
  const gastos = await getAllGastos( organization, status );
  //console.log('casas',casas)
  const listGastos=gastos.map( ( { name, _id, idTipoMovimiento, ingresoSalda }) => {
     //return  (codigoCasa !=='TODAS' ) ?{codigoCasa, name: 'Casa '+ codigoCasa+': '+name, id: _id}: null 
     return { id:_id, name, idTipoMovimiento , ingresoSalda}
  }).filter( c => c) ;
  //console.log('listCasas getServerSideProps',listCasas)
  return {
      props: {
        listGastos,
        organization,
        user
      }
  }
}
export default GastoPage;