import { useContext, useState } from 'react';
import NextLink from 'next/link';
//import { GetServerSideProps } from 'next';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import { useForm } from 'react-hook-form';
import { Box, Button, Chip, Grid, Link, TextField, Typography } from "@mui/material";

import { AuthLayout } from "../../components/layouts";
//import { gcApi } from '../../api';
import { ErrorOutline } from '@mui/icons-material';

import { validations } from '../../utils';
import { AuthContext } from '../../context';

type FormData = {
    name: string;
    email: string;
    password: string;   

  };

const RegisterPage = () => {
    console.log('registrar cuenta')
    const router= useRouter();
    const { registerUser }= useContext( AuthContext );
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [ showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState( '' );
    
    const onRegisterForm = async ( { name, email, password }: FormData ) =>{
        setShowError( false );
        const { hasError, message }= await registerUser(  name, email, password );
        if ( hasError  ){
            setShowError( true );
            setErrorMessage( errorMessage! ) // o errorMessage !! ''
            setTimeout( () => setShowError( false ), 3000 ); //se muestra 3 seg            
            return;
        }
        await signIn('credentials', { email, password});
    }
  return (
     <AuthLayout title={'Registra nuevo usuario'}  >
        <form onSubmit={ handleSubmit ( onRegisterForm ) } noValidate 
        >
            <Box sx={{ width: 350, padding: '10px 20px' }} >
                <Grid container spacing= {2} >
                    
                    <Grid item xs={ 12 }>
                        <Typography variant='h1' component='h1' >Crear cuenta</Typography>
                        <Chip
                                label='No se reconoce a ese usuario/contraseña'
                                color= 'error'
                                icon = { <ErrorOutline />} 
                                className='fadeIn'
                                sx={{ display: showError ? 'flex' : 'none'}}
                            />
                    </Grid>
                    <Grid item xs={ 12 }>
                        <TextField 
                                    type ='name'
                                    label='Nombre' 
                                    variant='filled'                             
                                    fullWidth 
                                    { ...register('name', { 
                                    required: 'Este campo es requerido',
                                    minLength: {value: 2 , message: 'Mínimo 3 caracteres'}
                                })}
                                error= { !!errors.name }
                                helperText ={ errors.name?.message}
                                />

                    </Grid>                
                    <Grid item xs={ 12 }>
                        <TextField 
                                type ='email'
                                label='Correo' 
                                variant='filled'                             
                                fullWidth 
                                { ...register('email', { //establece la relación del campo con el form
                                required: 'Este campo es requerido',
                                validate: validations.isEmail//equivale a (val) => validations.isEmail(val)
                            })}
                            error= { !!errors.email }
                            helperText ={ errors.email?.message}
                            />
                    </Grid>
                    <Grid item xs={ 12 }>
                        <TextField 
                            label='Contraseña' 
                            type='password' 
                            variant='filled'  
                            fullWidth 
                            { ...register('password',{ 
                                required: 'Este campo es requerido',
                                minLength: {value:6 , message: 'Mínimo 6 caracteres'}
                            } ) }
                            error= { !!errors.password }
                            helperText ={ errors.password?.message}
                        />
                    </Grid>

                    <Grid item xs={ 12 }>
                        <Button 
                            type='submit'
                            sx={{ backgroundColor: '#3A64D8', color: 'white'}}
                            className='circular-btn' 
                            size='large' 
                            fullWidth 
                            disabled={ showError }
                        >
                            Registrar cuenta
                        </Button>
                    </Grid>
                    <Grid item xs={ 12 }  display= 'flex' justifyContent='end' >
                        <NextLink 
                            href={router.query.p ? `/auth/login?p=${ router.query.p }` : '/auth/login'}
                            passHref
                        >
                            <Link underline='always' >
                                ¿Ya tienes cuenta?
                            </Link>
                        </NextLink>
                    </Grid>  
          
                </Grid>
            </Box>
        </form>

     </AuthLayout>
  )
}
// export const getServerSideProps: GetServerSideProps = async ({ req }) => {//302
//     const session = await getSession( { req });
//     //console.log('session en register',session)
//     if ( session ){
//        return {
//           redirect: {
//             destination: '/admin/home',
//             permanent: false,
//           }
//        } 
//     }
//     return {
//         props: {       }
//     }
// }
export default RegisterPage;