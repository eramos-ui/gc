import { Box, Typography } from "@mui/material";
import { PpalLayout } from "../components/layouts";

const Custom404 = () => (
    <PpalLayout title='Página no encontrada' pageDescription="No hay nada para mostrar aquí ">
        <Box display= 'flex' 
            justifyContent='center' 
            alignItems='center'
            height='calc(100vh-200px)'
            sx={{ flexDirection: { xs: 'column', sm: 'row'} }}
        >
            <Typography variant='h1' component='h1' fontSize= { 80} fontWeight={ 200 } >404 |</Typography>

            <Typography marginLeft={ 2 } >
                No encontramos ninguna página aquí
            </Typography>
        </Box>
    </PpalLayout>
)

export default Custom404;