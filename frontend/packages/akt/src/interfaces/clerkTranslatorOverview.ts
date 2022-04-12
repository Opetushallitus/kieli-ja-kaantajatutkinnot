import { Action } from 'redux';

import { APIResponseStatus } from 'enums/api';
import { ClerkTranslator } from 'interfaces/clerkTranslator';
import { WithId, WithVersion } from 'interfaces/with';

export interface ClerkTranslatorOverviewState {
  overviewStatus: APIResponseStatus;
  translatorDetailsStatus: APIResponseStatus;
  authorisationDetailsStatus: APIResponseStatus;
  selectedTranslator?: ClerkTranslator;
}

export interface ClerkTranslatorOverviewAction extends Action, Partial<WithId> {
  translator?: ClerkTranslator;
}

export interface AuthorisationAction
  extends Action,
    WithId,
    Partial<WithVersion> {
  permissionToPublish?: boolean;
}
