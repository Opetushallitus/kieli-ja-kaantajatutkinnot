interface RegistrationForm {
  first_name?: string;
  last_name?: string;
  birthdate?: string;
  ssn?: string;
  email?: string;
  phone_number?: string;
  [key: string]: unknown;
}

export type ClerkQuarantineMatchResponse = {
  id: number;
  birthdate: string;
  ssn: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  registrationId: number;
  form: RegistrationForm;
  state: string;
  examDate: string;
  languageCode: string;
};
