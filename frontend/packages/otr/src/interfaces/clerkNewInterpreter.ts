import { ClerkInterpreter } from 'interfaces/clerkInterpreter';
import { Qualification } from 'interfaces/qualification';

export interface ClerkNewInterpreter
  extends Omit<
    ClerkInterpreter,
    | 'id'
    | 'version'
    | 'isIndividualised'
    | 'hasIndividualisedAddress'
    | 'qualifications'
  > {
  onrId?: string;
  isIndividualised?: boolean;
  hasIndividualisedAddress?: boolean;
  qualifications: Array<Qualification>;
}
