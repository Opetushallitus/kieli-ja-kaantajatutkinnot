export interface PersonRegistrations {

}

export interface PersonDetails {
  firstNames: string;
  lastName: string;
  registrations: Array<PersonRegistrations>;
}

export interface PersonDetailsResponse {
  first_names: string;
  last_name: string;
  registrations: Array<PersonRegistrations>;
}
