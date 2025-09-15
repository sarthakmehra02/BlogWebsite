import axios from 'axios';

// This is the key: it uses the production URL if it exists, otherwise it falls back to your local server.
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const API = axios.create({ baseURL: API_URL });

// This interceptor automatically adds the login token to every request
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

export default API;