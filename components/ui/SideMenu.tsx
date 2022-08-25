import { useContext } from "react";
import { useRouter } from "next/router";
import { Box, Divider, Drawer, List, ListItem, ListItemIcon, ListItemText, ListSubheader } from "@mui/material"
import { AccountCircleOutlined,  LoginOutlined, VpnKeyOutlined, PaidOutlined, CreditScoreOutlined, DisplaySettingsOutlined, AccountBalanceOutlined } from '@mui/icons-material';
import { AuthContext, UIContext } from "../../context";

export const SideMenu = () => {
  const router = useRouter();
  const { isMenuOpen, toggleSideMenu }= useContext( UIContext);
  const { isLoggedIn, logout  } = useContext( AuthContext );
  const navigateTo = ( url: string ) => {
    toggleSideMenu();//esto ocultará el menú al tocar el mismo menú
    router.push( url );
  };
  //console.log('SideMenu-isLoggedIn',isLoggedIn)
  return (
    <Drawer
        open={ isMenuOpen }
        anchor='right'
        sx={{ backdropFilter: 'blur(4px)', transition: 'all 0.5s ease-out' }}
        onClose= { toggleSideMenu }
    >
        <Box sx={{ width: 250, paddingTop: 5 }}>            
            <List>   
                {
                    isLoggedIn &&( 
                    <>
                        <ListItem button >
                            <ListItemIcon>
                                <AccountCircleOutlined/>
                            </ListItemIcon>
                            <ListItemText primary={'Perfil'} />
                        </ListItem>
                    </>
                    )
                } 
                {
                    isLoggedIn 
                    ?(
                        <ListItem button
                            onClick={ logout }// ó onClick= {logout}
                        >
                            <ListItemIcon>
                                <LoginOutlined/>
                            </ListItemIcon>
                            <ListItemText primary={'Salir'} />
                        </ListItem>
                    ): (
                        <ListItem 
                            button
                            //onClick= {() => navigateTo (`/auth/login?p=${ router.asPath }`)} //al ingresar lo llevará a la página que estaba
                            onClick= {() => navigateTo ('/auth/login')}
                        >
                            <ListItemIcon>
                                <VpnKeyOutlined/>
                            </ListItemIcon>
                            <ListItemText primary={'Ingresar'} />
                        </ListItem>
                    )
                }
                {/* movimientos */}
                <Divider />
                <ListSubheader>Movimientos</ListSubheader>
                <ListItem button
                        onClick ={ () => navigateTo('/admin/ingreso')}
                >
                    <ListItemIcon>
                        <PaidOutlined/>
                    </ListItemIcon>
                    <ListItemText primary={'Ingreso'} />
                </ListItem>
                <ListItem button
                         onClick ={ () => navigateTo('/admin/gasto')}
                >
                    <ListItemIcon>
                        <CreditScoreOutlined/>
                    </ListItemIcon>
                    <ListItemText primary={'Gasto'} />
                </ListItem>
                {/* Consultas */}
                <Divider />
                <ListSubheader>Consultas</ListSubheader>
                <ListItem button
                    onClick ={ () => navigateTo('/admin/informeMensual')}
                >
                    <ListItemIcon>
                        <AccountBalanceOutlined/>
                    </ListItemIcon>
                    <ListItemText primary={'Informe mensual'} />
                </ListItem>
                <ListItem button
                     onClick ={ () => navigateTo('/admin/cartolaEntreFechas')}
                >
                    <ListItemIcon>
                        <DisplaySettingsOutlined/>
                    </ListItemIcon>
                    <ListItemText primary={'Informe movimientos'} />
                </ListItem>
            </List>
        </Box>
    </Drawer>
  )
}