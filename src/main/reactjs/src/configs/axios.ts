import axios from 'axios';

import { AppConstants } from 'enums/app';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    'Caller-Id': AppConstants.CallerID,
    'Content-Type': 'application/json',
  };

  return config;
});

export default axiosInstance;
