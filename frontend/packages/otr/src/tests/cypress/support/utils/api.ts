import { HTTPStatusCode } from 'shared/enums';

import { APIError } from 'enums/api';

export const createAPIErrorResponse = (error?: APIError) => {
  return {
    statusCode: HTTPStatusCode.BadRequest,
    body: {
      errorCode: error,
    },
  };
};
