
import {  PropsWithChildren, useState, useEffect, forwardRef } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import moment from "moment";
import NumberFormat from "react-number-format";

import { Box, Button, Grid, MenuItem, TextField } from '@mui/material';

import { PpalLayout } from "../../components/layouts";
import { getAllFamilias } from "../../database/dbFamilia";
import { gcApi } from "../../api";
import { SaveOutlined } from "@mui/icons-material";
import { dbUsers } from '../../database';
import { IUser } from '../../interfaces';

interface CustomProps {//https://codesandbox.io/s/5k8wm
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const NumberFormatCustom = forwardRef<NumberFormat<any>, CustomProps>(
  function NumberFormatCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <NumberFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            }
          });
        }}
        isNumericString
        //prefix={'$'}
        decimalScale={0}
        thousandSeparator={"."}
        decimalSeparator={","}
      />
    );
  }
);

type FormData = {
    casaSelected: string;
    fechaPago: string;
    cifra: string;
    //monto: number;
    organization:string;
    userId:string;
  };
  interface Props {
    listCasas: any[];
    organization: string,
    user:IUser;
  }
 const IngresoPage : React.FC<PropsWithChildren<Props>> = ( { listCasas , organization, user }) => {
  const router= useRouter();
  const { register, handleSubmit, formState: { errors }, setValue, getValues } = useForm<FormData>(
        { defaultValues: { casaSelected:listCasas[0].id, fechaPago: moment().format('yyyy-MM-DD'), cifra: undefined } });
  const [isSaving, setIsSaving] = useState( false );
  useEffect(() => {
    setValue('organization', organization ); //agregada a valore del form 
    const {_id:userId } = user;
    setValue( 'userId', userId );//usuario que opera  
  }, [organization, user, setValue])

  const onSubmit = async ( form : FormData ) =>{
   //const  valor= parseInt( getValues('cifra').toString().replace('.','') );//sacar el separador de miles
  //  console.log('valor',valor)
  //  setValue('monto', valor)
  //  console.log('form',form);

   setIsSaving(true);
   try{
     const { data }= await gcApi({
           url: '/admin/registrarIngreso',
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
   <PpalLayout title='Ingresos' pageDescription='Registro de ingresos'>
        <Box display='flex' justifyContent={'center'} sx={{ smb: 2 }}>
            <h3>Registrar de Ingreso</h3>
        </Box>
        <form onSubmit={ handleSubmit ( onSubmit ) } noValidate
        >
           <Box sx={{ width: 350, padding: '10px 20px' }} >
            <Grid item xs={ 12 }>
              <TextField
                value={ getValues('casaSelected') }
                onChange ={ (e) => setValue('casaSelected', e.target.value, { shouldValidate: true }) }
                sx={{ ml: 1, mt: 1, width: '400px' }}
                select                
                label="Familia a la que registra el ingreso"
                error= { !!errors.casaSelected }
                helperText= { errors.casaSelected?.message }
              >
                {
                  listCasas.map((option) => (
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
              <TextField
                    sx={{ maxWidth: 180, ml: 1, mt:3 }}
                    autoComplete='off'
                    label='Monto del pago'
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
              <Button
                        type='submit'
                        startIcon={ <SaveOutlined /> }
                        sx={{ ml: 2, mt: 3, width: '165px', height:'55px', backgroundColor: '#3A64D8', color: 'white'}}        
                        className='circular-btn'
                        disabled = { isSaving } 
              >
                        Registrar ingreso
              </Button>
            </Grid>
          </Box>
        </form>
   </PpalLayout>
  )
}
// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time
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
    const casas = await getAllFamilias( organization, status );
    //console.log('casas',casas)
    const listCasas=casas.map( ( { codigoCasa, name, _id }) => {
       return  (codigoCasa !=='TODAS' ) ?{codigoCasa, name: 'Casa '+ codigoCasa+': '+name, id: _id}: null 
    }).filter( c => c) ;
    //console.log('listCasas getServerSideProps',listCasas)
    return {
        props: {
          listCasas,
          organization,
          user
        }
    }
}
export default IngresoPage;