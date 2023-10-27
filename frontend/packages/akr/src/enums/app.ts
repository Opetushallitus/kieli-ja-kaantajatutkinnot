export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.akr',
}

export enum AppRoutes {
  PublicHomePage = '/akr/etusivu',
  ClerkHomePage = '/akr/virkailija',
  MeetingDatesPage = '/akr/virkailija/kokouspaivat',
  ExaminationDatesPage = '/akr/virkailija/tutkintopaivat',
  StatisticsPage = '/akr/virkailija/tilastot',
  ClerkSendEmailPage = '/akr/virkailija/laheta-sahkoposti',
  ClerkLocalLogoutPage = '/akr/cas/localLogout',
  ClerkTranslatorOverviewPage = '/akr/virkailija/kaantaja/:translatorId',
  ClerkPersonSearchPage = '/akr/virkailija/lisaa-kaantaja/haku',
  ClerkNewTranslatorPage = '/akr/virkailija/lisaa-kaantaja',
  AccessibilityStatementPage = '/akr/saavutettavuusseloste',
  PrivacyPolicyPage = '/akr/tietosuojaseloste',
  NotFoundPage = '*',
}

export enum HeaderTabNav {
  Register = 'register',
  ExaminationDates = 'examinationDates',
  MeetingDates = 'meetingDates',
  Statistics = 'statistics',
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
  EditTranslatorDetails = 'editTranslatorDetails',
  View = 'view',
}
