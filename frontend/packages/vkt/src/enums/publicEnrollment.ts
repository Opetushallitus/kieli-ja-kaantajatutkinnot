export enum PublicEnrollmentFormStep {
  Authenticate = 1,
  FillContactDetails,
  EducationDetails,
  SelectExam,
  Preview,
  Payment,
  PaymentSuccess,
  DoneQueued,
  Done,
}

export enum PublicEnrollmentAppointmentFormStep {
  Authenticate = 1,
  FillContactDetails,
  Preview,
  PaymentFail,
  PaymentSuccess,
}

export enum PublicEnrollmentContactFormStep {
  FillContactDetails = 1,
  Preview,
  Done,
}
