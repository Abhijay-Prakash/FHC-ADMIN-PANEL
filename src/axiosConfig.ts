import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://fhc-portal-be.onrender.com/api',  // Replace with your backend URL if needed
});

export default instance;
