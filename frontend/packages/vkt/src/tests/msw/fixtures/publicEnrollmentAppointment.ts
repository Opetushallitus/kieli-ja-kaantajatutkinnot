import { EnrollmentAppointmentStatus, ExamLanguage } from 'enums/app';
import { PublicEnrollmentAppointmentResponse } from 'interfaces/publicEnrollment';

export const publicEnrollmentAppointment: PublicEnrollmentAppointmentResponse =
  {
    id: 37,
    oralSkill: true,
    textualSkill: true,
    understandingSkill: true,
    speakingPartialExam: true,
    speechComprehensionPartialExam: true,
    writingPartialExam: true,
    readingComprehensionPartialExam: true,
    status: EnrollmentAppointmentStatus.WAITING_AUTHENTICATION,
    digitalCertificateConsent: false,
    email: 'vkt-public-enrollment-appointment@test.invalid',
    phoneNumber: '+1234567890',
    street: '',
    postalCode: '',
    town: '',
    country: '',
    examEvent: {
      date: '2024-12-22',
      examTime: '16:35',
      municipality: {
        code: '564',
      },
      location: 'Kolmoiskatu 3 A',
      language: ExamLanguage.FI,
      examiner: {
        name: 'Eero Eskola',
      },
    },
  };

export const publicEnrollmentAppointmentWithPerson: PublicEnrollmentAppointmentResponse =
  {
    ...publicEnrollmentAppointment,
    person: {
      id: 28,
      lastName: 'Nordea',
      firstName: 'Demo',
    },
  };
