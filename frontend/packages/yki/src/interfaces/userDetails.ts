interface PersonRegistrations {
  examSessionId: string;
  examLang: string;
  zip: string;
  postOffice: string;
  examDate: string;
  streetAddress: string;
}

interface PersonRegistrationsResponse {
  exam_session_id: string;
  exam_lang: string;
  zip: string;
  post_office: string;
  exam_date: string;
  street_address: string;
}

export interface PersonDetails {
  firstName: string;
  lastName: string;
  email: string;
  registrations: Array<PersonRegistrations>;
}

export interface PersonDetailsResponse {
  first_name: string;
  last_name: string;
  email: string;
  registrations: Array<PersonRegistrationsResponse>;
}
