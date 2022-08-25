//recibe un estado y una acción y devuelve un estado- es síncrono

//import { IUser } from '../../interfaces';
import { IUser } from '../../interfaces'
import { AuthState } from '..'


type AuthActionType  = 
   | { type: '[Auth] - Login', payload: IUser }
   | { type: '[Auth] - Logout' }
 export const authReducer = (state: AuthState , action: AuthActionType): AuthState =>{//es una función pura, debe trabajar sólo con los elementos que recibe
     //console.log('authReducer', state, action)      
     switch ( action. type) { //devuelve un nuevo estado no una mutación del mismo
          case '[Auth] - Login':
              //console.log('authReducer-login',{ ...state, isLoggedIn: true, user: action.payload })
              return { 
                   ...state,
                   isLoggedIn: true,
                   user: action.payload
              }
            case '[Auth] - Logout':
                return { 
                     ...state,
                     user: undefined,
                     isLoggedIn: false,
                }              
           default:
              return state;
         }
    }