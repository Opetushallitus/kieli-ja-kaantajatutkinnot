import { RouteHandler } from 'cypress/types/net-stubbing';
import { HTTPStatusCode } from 'shared/enums';

import { APIEndpoints, APIError } from 'enums/api';

export const runWithIntercept = (
  endpoint: APIEndpoints,
  response: RouteHandler,
  effect: () => void
) => {
  const alias = `intercepted-${endpoint}`;
  cy.intercept(endpoint, response).as(alias);
  effect();
  cy.wait(`@${alias}`);
};

export const createAPIErrorResponse = (error?: APIError) => {
  return {
    statusCode: HTTPStatusCode.BadRequest,
    body: {
      errorCode: error,
    },
  };
};
