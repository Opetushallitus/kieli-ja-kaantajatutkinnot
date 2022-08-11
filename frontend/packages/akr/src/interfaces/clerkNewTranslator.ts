import { APIResponseStatus } from 'shared/enums';

import { ClerkTranslator } from 'interfaces/clerkTranslator';
import { WithId } from 'interfaces/with';

export type ClerkNewTranslator = Omit<ClerkTranslator, 'id' | 'version'>;

export interface ClerkNewTranslatorState extends Partial<WithId> {
  status: APIResponseStatus;
  translator: ClerkNewTranslator;
}
