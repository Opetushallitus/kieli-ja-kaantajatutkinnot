import { FindByOidsOrganizationResponse } from 'interfaces/clerkOrganizerRegistry';
// @ts-expect-error import mock data without type declarations from JS file
import findByOids from 'tests/msw/fixtures/findByOidsData';

export const findByOidsResponse: FindByOidsOrganizationResponse[] = findByOids;
