import { AxiosError } from 'axios';
import { Action } from 'redux';
import { APIResponseStatus } from 'shared/enums';

import { ClerkTranslator } from 'interfaces/clerkTranslator';
import { WithId } from 'interfaces/with';

export type ClerkNewTranslator = Omit<ClerkTranslator, 'id' | 'version'>;

export interface ClerkNewTranslatorState extends Partial<WithId> {
  status: APIResponseStatus;
  translator: ClerkNewTranslator;
  error?: AxiosError;
}

export interface ClerkNewTranslatorAction extends Action, Partial<WithId> {
  translator?: ClerkNewTranslator;
  error?: AxiosError;
}
