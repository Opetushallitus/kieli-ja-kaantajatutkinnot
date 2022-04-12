import axios from 'axios';

import { AppConstants } from 'enums/app';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  const CSRF_NAME = 'CSRF';

  config.xsrfCookieName = CSRF_NAME;
  config.xsrfHeaderName = CSRF_NAME;
  config.withCredentials = true;

  config.headers = {
    ...config.headers,
    'Caller-Id': AppConstants.CallerID,
    'Content-Type': 'application/json',
  };

  return config;
});

export default axiosInstance;
