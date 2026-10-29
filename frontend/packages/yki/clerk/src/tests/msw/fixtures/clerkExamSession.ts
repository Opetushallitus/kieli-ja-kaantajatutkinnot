import {
  ExamLanguage,
  ExamLevel,
  ExamSessionType,
  RegistrationKind,
} from 'enums/app';
import { ClerkExamSessionResponse } from 'interfaces/clerkExamSession';
import { registrations } from 'tests/msw/fixtures/clerkExamSessionRegistrations';

export const clerkExamSession: ClerkExamSessionResponse = {
  level: ExamLevel.YLIN,
  language: ExamLanguage.FIN,
  type: ExamSessionType.FULL,
  open: true,
  upcomingAdmission: true,
  participants: 5,
  participantsReadListen: 5,
  participantsSpeakWrite: 5,
  maxParticipantsTotal: 15,
  maxParticipantsReadListen: 10,
  maxParticipantsSpeakWrite: 10,
  startTimeReadListen: '11:00',
  startTimeSpeakWrite: '13:00',
  queue: 2,
  contactName: 'Teppo-Testi Järjestäjä',
  contactPhoneNumber: '+358401234567',
  contactEmail: 'jarjestaja@testi.invalid',
  officeOid: '1.2.246.562.10.29461948951',
  publishedAt: '2019-01-15T11:16:37.959Z',
  date: '2035-01-01',
  organizerOid: '1.2.246.562.10.28646781493',
  id: 999,
  registrationStartDate: '2023-01-01',
  location: [
    {
      lang: 'fi',
      extraInformation: '',
      name: 'Jälkiedu',
      otherLocationInfo: 'auditorio A2',
      streetAddress: 'Jokukatu 4',
      postOffice: 'Tampere',
      zip: '00100',
    },
    {
      lang: 'sv',
      extraInformation: '',
      name: 'Jälkiedu',
      otherLocationInfo: 'auditorium A2',
      streetAddress: 'Jokukatu 4',
      postOffice: 'Tammerfors',
      zip: '00100',
    },
    {
      lang: 'en',
      extraInformation: '',
      name: 'Jälkiedu',
      otherLocationInfo: 'auditorium A2',
      streetAddress: 'Jokukatu 4',
      postOffice: 'Tampere',
      zip: '00100',
    },
  ],
  examFee: 200,
  registrationEndDate: '2030-12-31',
  availableRegistrationKind: RegistrationKind.Admission,
  registrations: registrations.map((registration) => ({
    ...registration,
    partialExamType: 'ALL_PARTS',
    queuePosition: registration.id === 7 ? 2 : registration.queuePosition,
  })),
};

// Direct URLs: /yki/v2/virkailija/tilaisuus/999, /1000 and /1001.
export const clerkExamSessions: ClerkExamSessionResponse[] = [
  clerkExamSession,
  {
    ...clerkExamSession,
    id: 1000,
    type: ExamSessionType.READ_SPEAK,
    participantsReadListen: 4,
    participantsSpeakWrite: 3,
    registrations,
  },
  {
    ...clerkExamSession,
    id: 1001,
    type: ExamSessionType.LISTEN_WRITE,
    participantsReadListen: 4,
    participantsSpeakWrite: 3,
    registrations: registrations.map((registration) => ({
      ...registration,
      partialExamType:
        registration.partialExamType === 'READ'
          ? 'LISTEN'
          : registration.partialExamType === 'SPEAK'
            ? 'WRITE'
            : registration.partialExamType,
    })),
  },
];
