import { ClerkInterpreter } from 'interfaces/clerkInterpreter';

export interface ClerkNewInterpreter
  extends Omit<
    ClerkInterpreter,
    | 'id'
    | 'version'
    | 'deleted'
    | 'isIndividualised'
    | 'hasIndividualisedAddress'
  > {
  onrId?: string;
  isIndividualised?: boolean;
  hasIndividualisedAddress?: boolean;
}
