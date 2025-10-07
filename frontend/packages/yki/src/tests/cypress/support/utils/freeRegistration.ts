import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import {
  FreeRegistrationBasis,
  FreeRegistrationStatus,
  Registration,
} from 'interfaces/clerkFreeRegistration';

export const getFreeRegistrationStatusText = (
  status: FreeRegistrationStatus,
) => {
  switch (status) {
    case 'PENDING':
      return 'Maksuttomuus tarkastamatta';
    case 'APPROVED':
      return 'Maksuttomuus hyväksytty';
    case 'REJECTED':
      return 'Maksuttomuus hylätty';
    case 'INFORMATION_REQUESTED':
      return 'Lisätietopyyntö lähetetty, odottaa vastausta';
    case 'INFORMATION_REQUEST_ANSWERED':
      return 'Maksuttomuus tarkastamatta, lisätietopyyntöön vastattu';
    case 'INFORMATION_REQUEST_EXPIRED':
      return 'Maksuttomuus tarkastamatta, lisätietopyyntöön ei vastattu';
    default:
      return '';
  }
};

export const getFreeRegistrationBasisText = (basis: FreeRegistrationBasis) => {
  switch (basis) {
    case 'MATRICULATION_EXAMINATION':
      return 'Opiskellut Suomessa: ylioppilastutkinto';
    case 'HIGHER_EDUCATION_DEGREE':
      return 'Opiskellut Suomessa: korkeakoulututkinto';
    case 'HIGHER_EDUCATION_STUDIES':
      return 'Opiskellut Suomessa: suorittamassa korkeakouluopintoja';
    case 'COMPARABLE_MATRICULATION_EXAMINATION':
      return 'Opiskellut ulkomailla: ylioppilastutkinto';
    case 'COMPARABLE_HIGHER_EDUCATION_DEGREE':
      return 'Opiskellut ulkomailla: korkeakoulututkinto';
    case 'COMPARABLE_HIGHER_EDUCATION_STUDIES':
      return 'Opiskellut ulkomailla: suorittamassa korkeakouluopintoja';
    default:
      return '';
  }
};

export const getFreeRegistrationKindText = (registration: Registration) => {
  if (registration.kind === 'ADMISSION') {
    return 'Ilmoittautunut';
  }

  return `Jonossa (${registration.positionInQueue}/${registration.queue})`;
};

export const getFormattedDateText = (date: string) => {
  if (date) {
    return DateUtils.formatOptionalDate(dayjs(date));
  }

  return '-';
};
