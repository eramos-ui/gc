import axios from 'axios';

const gcApi = axios.create({
    baseURL: '/api'
});
 export default gcApi;