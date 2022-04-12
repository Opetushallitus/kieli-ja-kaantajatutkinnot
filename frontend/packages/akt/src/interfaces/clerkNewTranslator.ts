import { Action } from 'redux';

import { APIResponseStatus } from 'enums/api';
import { ClerkTranslator } from 'interfaces/clerkTranslator';
import { WithId } from 'interfaces/with';

export type ClerkNewTranslator = Omit<ClerkTranslator, 'id' | 'version'>;

export interface ClerkNewTranslatorState extends Partial<WithId> {
  status: APIResponseStatus;
  translator: ClerkNewTranslator;
}

export interface ClerkNewTranslatorAction extends Action, Partial<WithId> {
  translator?: ClerkNewTranslator;
}
