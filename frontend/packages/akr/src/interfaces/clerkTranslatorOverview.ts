import { AxiosError } from 'axios';
import { Action } from 'redux';
import { APIResponseStatus } from 'shared/enums';

import { ClerkTranslator } from 'interfaces/clerkTranslator';
import { WithId, WithVersion } from 'interfaces/with';

export interface ClerkTranslatorOverviewState {
  overviewStatus: APIResponseStatus;
  translatorDetailsStatus: APIResponseStatus;
  authorisationDetailsStatus: APIResponseStatus;
  selectedTranslator?: ClerkTranslator;
  error?: AxiosError;
}

export interface ClerkTranslatorOverviewAction extends Action, Partial<WithId> {
  translator?: ClerkTranslator;
  error?: AxiosError;
}

export interface AuthorisationAction
  extends Action,
    WithId,
    Partial<WithVersion> {
  permissionToPublish?: boolean;
  error?: AxiosError;
}
