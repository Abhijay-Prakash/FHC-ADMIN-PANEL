import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://fhc-portal-be.onrender.com/api',
  withCredentials: true,
});

export default instance;
