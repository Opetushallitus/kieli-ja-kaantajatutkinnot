import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import {
  FreeRegistrationStatus,
  Registration,
} from 'interfaces/clerkFreeRegistration';
import { FreeRegistrationBasis } from 'interfaces/freeRegistration';

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
    case 'SUPPLEMENT_REQUESTED':
      return 'Lisätietopyyntö lähetetty, odottaa vastausta';
    case 'SUPPLEMENT_REQUEST_ANSWERED':
      return 'Maksuttomuus tarkastamatta, lisätietopyyntöön vastattu';
    case 'SUPPLEMENT_REQUEST_EXPIRED':
      return 'Maksuttomuus tarkastamatta, lisätietopyyntöön ei vastattu';
    default:
      return '';
  }
};

export const getLanguageOfServiceText = (language: 'fi' | 'sv' | 'en') => {
  switch (language) {
    case 'fi':
      return 'suomi';
    case 'sv':
      return 'ruotsi';
    case 'en':
      return 'englanti';
  }
};

export const getFreeRegistrationBasisText = (basis: FreeRegistrationBasis) => {
  switch (basis) {
    case 'MatriculationExam':
      return 'Opiskellut Suomessa: ylioppilastutkinto';
    case 'HigherEducationConcluded':
      return 'Opiskellut Suomessa: korkeakoulututkinto';
    case 'HigherEducationEnrolled':
      return 'Opiskellut Suomessa: suorittamassa korkeakouluopintoja';
    case 'ComparableMatriculation':
      return 'Opiskellut ulkomailla: ylioppilastutkinto';
    case 'ComparableHigherEducationConcluded':
      return 'Opiskellut ulkomailla: korkeakoulututkinto';
    case 'ComparableHigherEducationEnrolled':
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
