export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.akr',
}

export enum AppRoutes {
  PublicHomePage = '/akr/etusivu',
  ClerkHomePage = '/akr/virkailija',
  MeetingDatesPage = '/akr/virkailija/kokouspaivat',
  ExaminationDatesPage = '/akr/virkailija/tutkintopaivat',
  ClerkSendEmailPage = '/akr/virkailija/laheta-sahkoposti',
  ClerkLocalLogoutPage = '/akr/cas/localLogout',
  ClerkTranslatorOverviewPage = '/akr/virkailija/kaantaja/:translatorId',
  ClerkNewTranslatorPage = '/akr/virkailija/lisaa-kaantaja',
  AccessibilityStatementPage = '/akr/saavutettavuusseloste',
  PrivacyPolicyPage = '/akr/tietosuojaseloste',
  NotFoundPage = '*',
}

export enum HeaderTabNav {
  Register = 'register',
  ExaminationDates = 'examinationDates',
  MeetingDates = 'meetingDates',
}

export enum PermissionToPublish {
  Yes = 'yes',
  No = 'no',
}

export enum PublicUIViews {
  PublicTranslatorListing = 'PublicTranslatorListing',
  ContactRequest = 'ContactRequest',
}

export enum SearchFilter {
  FromLang = 'fromLang',
  ToLang = 'toLang',
  Name = 'name',
  Town = 'town',
}

export enum UIMode {
  EditAuthorisationDetails = 'editAuthorisationDetails',
  EditTranslatorDetails = 'editTranslatorDetails',
  View = 'view',
}
