export const teuvoRegistrationDetails = {
  first_name: 'Teuvo',
  last_name: 'Testitapaus',
  ssn: '030594W903B',
  post_office: 'Helsinki',
  zip: '00100',
  street_address: 'Unioninkatu 1',
  // Suomi.fi supplies neither of the following, so weakly authenticated users
  // must fill them in themselves. Both are mandatory only on the weak path.
  preferred_name: 'Teuvo',
  // Koodisto display name (kieli_fi), not the 'FI' code: the form selects by label.
  native_language: 'suomi',
};
