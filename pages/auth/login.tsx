import { useEffect, useState } from "react";
import { GetServerSideProps } from 'next';
import NextLink from 'next/link';
import { signIn, getSession, getProviders } from 'next-auth/react';
//import { useRouter } from "next/router";

import { useForm } from "react-hook-form";

import { Box, Button, Chip, Divider, Grid, Link, TextField, Typography } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";
import { AuthLayout } from "../../components/layouts";
import { validations } from '../../utils';
//import { redirect } from "next/dist/server/api-utils";

type FormData = {
    email: string;
    password: string;    
  };
const title='Ingresar';
const LoginPage = () => {
    //console.log('Login Page')
    // const router= useRouter();
    // const sesion=useSession();
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [ showError, setShowError] = useState(false);
    const [ providers, setProviders ] = useState<any>({});//any porque el tipo es grande y no ayuda
    //console.log('LoginPage router',router)
    useEffect(() => {
        getProviders().then( prov =>{
            //console.log('getProviders:',{prov});  
            setProviders( prov );
        })
      }, [])
    const onLoginUser = async ( { email, password }: FormData ) => { //data: FormData 
        //const { email, password }= data;
        //console.log( 'LoginPage-onloginUser',email, password);
        setShowError( false );
        //console.log('sesion',sesion)  
        await signIn('credentials', { email, password });
            
    }
    return (
        <AuthLayout title={title.toString()}>
            <Box display='flex' alignItems='center' justifyContent='center'>
                <form onSubmit={ handleSubmit ( onLoginUser) } noValidate >
                    <Box sx={{ width: 350, padding: '10px 20px' }} >
                        <Grid container spacing= {2} >
                            <Grid item xs={ 12 }>
                                <Typography variant='h1' component='h1' >Iniciar sesión</Typography>
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
                                    type ='email'
                                    label='Correo' 
                                    variant='filled'                             
                                    fullWidth 
                                    { ...register('email', { //establece la relación del campo con el form
                                    //required: true
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
                                    type='password' variant='filled'  
                                    fullWidth 
                                    { ...register('password',{ 
                                        required: 'Este campo es requerido',
                                        minLength: {value:6 , message: 'Mínimo 6 caracteres'}
                                    } ) }
                                    error= { !!errors.password }
                                    helperText ={ errors.password?.message}
                                />
                            </Grid>
                            <Grid item xs={ 12 } >
                                <Button 
                                    type='submit'
                                    sx={{ backgroundColor: '#3A64D8', color: 'white'}}                                    
                                    className='circular-btn' 
                                    size='large' 
                                    fullWidth                             
                                    disabled={ showError }
                                >
                                    Ingresar
                                </Button>
                            </Grid>
                            <Grid item xs={ 12 }  display= 'flex' justifyContent='end' >
                                <NextLink 
                                    href='/auth/register'
                                // href={ router.query.p ? `/auth/register?p=${ router.query.p }`: '/auth/register' }
                                    passHref>
                                    <Link underline='always' >
                                        Crear cuenta
                                    </Link>
                                </NextLink>
                            </Grid>  
                            <Grid item xs={ 12 }  display= 'flex' flexDirection='column' justifyContent='end' >
                                <Divider sx={{ width: '100%', mb:2 }} />                      
                                {//304
                                    Object.values( providers ).map (( provider: any) => {//convierte objeto en array                                    
                                    if ( provider.id === 'credentials' ) return (<div key='credentials'></div>);// para que no renderice el propio
                                    //console.log('onclick',provider);
                                    return (
                                        <Button
                                            key= { provider.id }
                                            variant = 'outlined'
                                            fullWidth
                                            color= 'primary'
                                            sx={{ mb: 1}}
                                            onClick={ () => signIn( provider.id )  }
                                        >
                                            { provider. name }
                                        </Button>
                                    )
                                    })
                                }
                            </Grid>                  
                        </Grid>
                    </Box>
                </form>
            </Box>
         </AuthLayout>
    )

}
// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time
export const getServerSideProps: GetServerSideProps = async ( { req }) => {//302
    
    const session = await getSession( { req });
    console.log('session in login', session);
    if ( session ){
       return {
          redirect: {
            destination: '/admin/home',
            permanent: false,
          }
       } 
    }
    return {
        props: {       }
    }
}
export default LoginPage;