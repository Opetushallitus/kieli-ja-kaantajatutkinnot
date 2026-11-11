import { RegistrationKind, RegistrationStates } from 'enums/app';
import { PersonRegistrations } from 'interfaces/userDetails';

export class UserRegistrationUtils {
  static hasQueueEnded(registration: PersonRegistrations) {
    return (
      registration.kind === RegistrationKind.Queue &&
      registration.state === RegistrationStates.Expired
    );
  }

  static isCancelled(registration: PersonRegistrations) {
    return [
      RegistrationStates.Cancelled,
      RegistrationStates.Expired,
      RegistrationStates.PaidAndCancelled,
    ].includes(registration.state);
  }
}
