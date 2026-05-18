import { FindByOidsOrganizationResponse } from 'interfaces/clerkOrganizerRegistry';
// @ts-expect-error import mock data without type declarations from JS file
import findByOid from 'tests/msw/fixtures/findByOidData';

export const findByOidResponse: FindByOidsOrganizationResponse[] = findByOid;
