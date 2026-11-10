import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { RegistrationKind, RegistrationStates } from 'enums/app';
import { PersonRegistrations } from 'interfaces/userDetails';

dayjs.extend(utc);
dayjs.extend(timezone);

export class UserRegistrationUtils {
  static hasQueueEnded(registration: PersonRegistrations) {
    if (
      registration.kind !== RegistrationKind.Queue ||
      registration.state !== RegistrationStates.Submitted
    ) {
      return false;
    }

    const today = dayjs(dayjs().tz('Europe/Helsinki').format('YYYY-MM-DD'));

    // Match the queue handler: places can be offered throughout registration
    // and afterwards up to and including seven days before the exam.
    return (
      today.isAfter(registration.registrationEndDate, 'day') &&
      today.isAfter(registration.examDate.subtract(1, 'week'), 'day')
    );
  }

  static isCancelled(registration: PersonRegistrations) {
    return (
      [
        RegistrationStates.Cancelled,
        RegistrationStates.Expired,
        RegistrationStates.PaidAndCancelled,
      ].includes(registration.state) ||
      UserRegistrationUtils.hasQueueEnded(registration)
    );
  }
}
