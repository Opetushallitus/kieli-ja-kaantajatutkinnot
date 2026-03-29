import axios, { AxiosHeaders } from 'axios';

import { AppConstants } from 'enums/app';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  const CSRF_NAME = 'CSRF';
  const customHeaders = { ...config.headers } as AxiosHeaders;

  customHeaders['Caller-Id'] = AppConstants.CallerID;
  customHeaders['Content-Type'] = 'application/json';

  config.xsrfCookieName = CSRF_NAME;
  config.xsrfHeaderName = CSRF_NAME;
  config.withCredentials = true;
  config.headers = customHeaders;

  return config;
});

export default axiosInstance;
