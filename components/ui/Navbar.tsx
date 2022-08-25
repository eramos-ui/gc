import { useContext, useState } from 'react';

import { AppBar, Box, Button,  Toolbar, Chip } from '@mui/material';

import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { UIContext } from '../../context/ui';
import { useSession } from 'next-auth/react';


export const Navbar = () => {
  const [isNameOrganizationVisible, setIsNameOrganizationVisible ] = useState( false ); //para discrimar si mostar o no el nombre de la comunidad
  const { data } = useSession() as any; 

  let nameOfOrganization='';
  let nameAdmin=''
  if ( data ){
      const { user }  = data ;
      const { name , nameOrganization = '' } = user;
      nameOfOrganization=nameOrganization;
      nameAdmin = name;
  }
  const { toggleSideMenu } = useContext(UIContext);  
  return (
   <AppBar>
      <Toolbar>
      {/* xs-auto	sm-728px	md-940	lg-1170 */}
        <Box className='fadeIn' sx= {{ display: isNameOrganizationVisible ? 'none': { xs: 'none', md: 'block'}}} >
            <Chip  sx={{ fontSize : 20, fontWeight: 'bold', backgroundColor: 'white' }} label={`Gastos comunes de: ${ nameOfOrganization } `} />    
        </Box>
        <Box flex={ 1 } />
            <Chip  icon={<PersonOutlinedIcon />} label= {nameAdmin} color='info'  />
            <Button onClick={ toggleSideMenu }>
                    Menú
            </Button>
      </Toolbar>
   </AppBar>
  )
}
