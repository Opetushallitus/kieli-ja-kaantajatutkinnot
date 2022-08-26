import { ClerkInterpreter } from 'interfaces/clerkInterpreter';

export interface ClerkNewInterpreter
  extends Omit<
    ClerkInterpreter,
    'id' | 'version' | 'deleted' | 'isIndividualised'
  > {
  onrId?: string;
  isIndividualised?: boolean;
}
