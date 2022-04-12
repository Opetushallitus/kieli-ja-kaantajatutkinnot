import { Authorisation } from 'interfaces/authorisation';
import { CLERK_TRANSLATOR_AUTHORISATION_ADD } from 'redux/actionTypes/authorisation';

export const addAuthorisation = (authorisation: Authorisation) => ({
  type: CLERK_TRANSLATOR_AUTHORISATION_ADD,
  authorisation,
});
