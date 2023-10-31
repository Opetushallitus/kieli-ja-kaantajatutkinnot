import { Authorisation } from 'interfaces/authorisation';
import { ClerkTranslator } from 'interfaces/clerkTranslator';

export interface ClerkNewTranslator
  extends Omit<ClerkTranslator, 'id' | 'version' | 'authorisations'> {
  authorisations: Array<Authorisation>;
}
