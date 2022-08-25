import  { PropsWithChildren, useEffect, useReducer } from 'react';
import { useSession, signOut } from 'next-auth/react';
//import { useRouter } from 'next/router';

import Cookies from 'js-cookie';
import axios, { AxiosError } from 'axios';

import { AuthContext, authReducer } from '..';
import { IUser } from '../../interfaces';
import { gcApi } from '../../api';
export interface AuthState {
    isLoggedIn: boolean;
    user?: IUser;
}
const AUTH_INITIAL_STATE: AuthState ={//el estado inicial
    isLoggedIn: false,
    user: undefined
}

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
    //aquí va cómo se comportará
    const [ state, dispatch ] = useReducer( authReducer, AUTH_INITIAL_STATE )// el estado debe ser del tipo del reducer
    const { data, status } = useSession(); 
    //console.log('AuthProvider data-status',data, status )  
    //const router=useRouter();
    useEffect(() => {// con next_auth/react 
       if ( status === 'authenticated' ){
          //console.log('AuthProvider autenticado',{ data })
          dispatch({ type: '[Auth] - Login', payload: data?.user as IUser }) //, payload: data?.user as IUser
       }
    }, [ status, data])
    /*
    const checkToken = async() => {
      if ( !Cookies.get( 'token' )) {//si no hay token
        return;  
      }
      try {
        const { data } = await tesloApi.get( 'user/validate-token');
        const { token, user } = data;
        Cookies.set('token', token);
        dispatch({ type: '[Auth] - Login', payload: user}) ;
     } catch( error ){
        Cookies.remove('token');
        return false;
     }
    };
    */
   
    const loginUser= async( email: string, password: string ): Promise<boolean> => {
        try {
           const { data } = await gcApi.post( 'user/login',{ email, password });
           const { token, user } = data;
           //console.log('loginUser AuthProvider',data)
          //  const token='111111111111111111111111111111111';
          //  const user= {_id: '12312321',name: 'Perico', email:'erich@gmail.com'};
           Cookies.set('token', token);
           Cookies.set('name', user.name);
           dispatch({ type: '[Auth] - Login', payload: user}) ;
           return true;
        } catch( error ){
           return false;
        }
    };
    
    const logout = () => {
      console.log('logout') 
      Cookies.remove('name');//300
      signOut();//cierra la sesión
     
    };
    
    //el objeto de retorno puede ser una interfa< o definirla en línea (como se hace)
    const registerUser= async ( name: string, email: string, password: string ): Promise<{hasError: boolean; message?: string}> =>{
      try {
        const { data } = await gcApi.post( 'user/register',{ name, email, password });
        const { token, user } = data;
        Cookies.set('token', token);
        dispatch({ type: '[Auth] - Login', payload: user}) ;
        return {
          hasError: false
        }
      }catch( err ){
         if ( axios.isAxiosError( err )){
            const error = err as AxiosError;
           return {
             hasError: true,
             message: error.message
           }
         }
         return {
           hasError: true,
           message: 'No se pudo crear el usuario - intente de nuevo'
         }
      }
    }
    
    return (
     <AuthContext.Provider value= {{
        ...state,
        loginUser,
        registerUser,
        logout,
     }}>
        { children }
      </AuthContext.Provider>
   )
  }