import { useContext } from 'react';
import NextLink from 'next/link';//NetLink para no confundirlo con le de mui
import { AppBar,  Box, Button,Link, Toolbar, Typography } from '@mui/material';

import {  UIContext } from '../../../context';

export const AdminNavbar = () => {
  const { toggleSideMenu } = useContext(UIContext);


  return (
     <AppBar>
        <Toolbar>
            <NextLink href='/' passHref >
                <Link display = 'flex' alignItems = 'center' >
                    <Typography variant='h6' >Gestión de Gastos comunes</Typography>                    
                    {/* <Typography  sx={{ ml: 0.5 }} >Shop</Typography> */}
                </Link>
            </NextLink>
            {/* para que ocupe todo el espacio */}
            <Box flex={ 1 }  />

            <Button onClick={toggleSideMenu}>
                Menú
            </Button>
        </Toolbar>
     </AppBar>
  )
}
