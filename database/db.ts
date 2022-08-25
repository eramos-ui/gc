import mongoose from 'mongoose';

/*
 0: disconnected
 1: connected
 2: connecting
 3: disconnecting
*/
const mongoConnection = {
    isConnected: 0
}
export const connect = async () => {
    if ( mongoConnection.isConnected ){
        console.log('ya estamos conectados');
        return;
    }
    if ( mongoose.connections.length > 0 ){
        mongoConnection.isConnected= mongoose.connections[0].readyState;
        if ( mongoConnection.isConnected === 1 ) {
            console.log('usando conexión existente');
            return;
        }
        await mongoose.disconnect();
            
    }
    await mongoose.connect( process.env.MONGO_URL || '' );
    mongoConnection.isConnected= 1;
    console.log('Conectando a MongoDB', process.env.MONGO_URL )
}
export const disconnect = async () => {
    if ( process.env.NODE_ENV === 'development' ) return;//si está en desarrollo no se desconectará
    if ( mongoConnection.isConnected !== 0 ) {
        await mongoose.disconnect();
        mongoConnection.isConnected= 0;
        console.log('Desconectado de MongoDB')
    }
}