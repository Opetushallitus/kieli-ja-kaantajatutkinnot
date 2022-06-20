import { AxiosResponse } from 'axios';

import { PublicTranslatorResponse } from 'interfaces/publicTranslator';

export const createResponse = (
  response: PublicTranslatorResponse
): AxiosResponse<PublicTranslatorResponse> => {
  return {
    data: response,
    status: 200,
    statusText: 'ok',
    headers: {},
    config: {},
  };
};

export const expectedResponse: PublicTranslatorResponse = {
  translators: [
    {
      id: 1,
      firstName: 'Testi',
      lastName: 'Esimerkki',
      languagePairs: [{ from: 'FI', to: 'SV' }],
      town: 'Espoo',
      country: 'FIN',
    },
    {
      id: 2,
      firstName: 'Testi 2',
      lastName: 'Esimerkki 2',
      languagePairs: [{ from: 'FI', to: 'FR' }],
      town: 'Paris',
      country: 'FRA',
    },
    {
      id: 3,
      firstName: 'Testi 3',
      lastName: 'Esimerkki 3',
      languagePairs: [{ from: 'SV', to: 'FR' }],
    },
  ],
  langs: { from: ['FI', 'SV'], to: ['SV', 'FR'] },
  towns: ['Espoo', 'Paris'],
};
