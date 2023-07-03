import { WithId } from 'shared/interfaces';

export interface PublicPerson extends WithId {
  lastName: string;
  firstName: string;
}
