import axios from 'axios';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  const CSRF_NAME = 'CSRF';

  config.xsrfCookieName = CSRF_NAME;
  config.xsrfHeaderName = CSRF_NAME;
  config.withCredentials = true;

  config.headers = {
    ...config.headers,
    'Caller-Id': '1.2.246.562.10.00000000001.otr', // Fixme
    'Content-Type': 'application/json',
  };

  return config;
});

export default axiosInstance;
