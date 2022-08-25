import { Box, CircularProgress, Typography } from "@mui/material";
import { PpalLayout } from "../components/layouts";

const LoadingPage = () => (
    <PpalLayout title='Cargando' pageDescription="">
        <Box display= 'flex' 
            justifyContent='center' 
            alignItems='center'
            height='calc(100vh-200px)'
            sx={{ flexDirection: { xs: 'column', sm: 'row'} }}
        >
            {/* <Typography variant='h3' component='h3' fontSize= { 80} fontWeight={ 200 } >Cargando</Typography> */}
            <CircularProgress />
            <Typography marginLeft={ 2 } >
                Cargando......
            </Typography>
        </Box>
    </PpalLayout>
)

export default LoadingPage;