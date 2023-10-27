import { Authorisation } from 'interfaces/authorisation';
import { ClerkTranslator } from 'interfaces/clerkTranslator';

export interface ClerkNewTranslator
  extends Omit<
    ClerkTranslator,
    | 'id'
    | 'version'
    | 'isIndividualised'
    | 'hasIndividualisedAddress'
    | 'authorisations'
  > {
  onrId?: string;
  isIndividualised?: boolean;
  hasIndividualisedAddress?: boolean;
  authorisations: Array<Authorisation>;
}
