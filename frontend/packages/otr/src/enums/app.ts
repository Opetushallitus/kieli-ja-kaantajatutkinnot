export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.otr',
}

export enum AppRoutes {
  PublicHomePage = '/otr/etusivu',
  ClerkHomePage = '/otr/virkailija',
  ClerkInterpreterOverviewPage = '/otr/virkailija/tulkki/:interpreterId',
  ClerkLocalLogoutPage = '/otr/cas/localLogout',
  AccessibilityStatementPage = '/otr/saavutettavuusseloste',
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
}

export enum UIMode {
  EditQualificationDetails = 'editQualificationDetails',
  EditInterpreterDetails = 'editInterpreterDetails',
  View = 'view',
}
