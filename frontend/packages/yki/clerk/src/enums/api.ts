export enum APIEndpoints {
  CountryCodes = '/yki/api/code/maatjavaltiot2',
  ClerkOrganizer = '/yki/v2/api/clerk/organizer',
  ClerkFreeRegistration = '/yki/v2/api/clerk/registration/approvals',
  ClerkFreeRegistrationDetails = '/yki/v2/api/clerk/registration/approval/:id',
  ClerkFreeRegistrationSupplementRequest = '/yki/v2/api/clerk/registration/approval/:id/supplement-request',
  ClerkFreeRegistrationDetailsMessages = '/yki/v2/api/clerk/registration/approval/:id/comment',
  ClerkCustomerDetails = '/yki/v2/api/clerk/customer/:oid',
  ClerkCustomersSearch = '/yki/v2/api/clerk/customer/search?page=:page&size=:size',
  ExamDate = '/yki/v2/api/exam-date',
  User = '/yki/api/user/identity',
}
