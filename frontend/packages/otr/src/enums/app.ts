export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.otr',
}

export enum AppRoutes {
  PublicRoot = '/otr',
  PublicHomePage = '/otr/etusivu',
  ClerkHomePage = '/otr/virkailija',
  MeetingDatesPage = '/otr/virkailija/kokouspaivat',
  ClerkInterpreterOverviewPage = '/otr/virkailija/tulkki/:interpreterId',
  ClerkPersonSearchPage = '/otr/virkailija/lisaa-tulkki/haku',
  ClerkNewInterpreterPage = '/otr/virkailija/lisaa-tulkki',
  ClerkLocalLogoutPage = '/otr/cas/localLogout',
  AccessibilityStatementPage = '/otr/saavutettavuusseloste',
  PrivacyPolicyPage = '/otr/tietosuojaseloste',
  NotFoundPage = '*',
}

export enum SearchFilter {
  FromLang = 'fromLang',
  ToLang = 'toLang',
  Name = 'name',
  Region = 'region',
}

export enum HeaderTabNav {
  Register = 'register',
  MeetingDates = 'meetingDates',
}

export enum UIMode {
  EditInterpreterDetails = 'editInterpreterDetails',
  View = 'view',
}
