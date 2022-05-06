export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.akt',
}

export enum AppRoutes {
  PublicHomePage = '/akt/etusivu',
  ClerkHomePage = '/akt/virkailija',
  MeetingDatesPage = '/akt/virkailija/kokouspaivat',
  ExaminationDatesPage = '/akt/virkailija/tutkintopaivat',
  ClerkSendEmailPage = '/akt/virkailija/laheta-sahkoposti',
  ClerkLocalLogoutPage = '/akt/cas/localLogout',
  ClerkTranslatorOverviewPage = '/akt/virkailija/kaantaja/:translatorId',
  ClerkNewTranslatorPage = '/akt/virkailija/lisaa-kaantaja',
  AccessibilityStatementPage = '/akt/saavutettavuusseloste',
  NotFoundPage = '*',
}

export enum CustomTextFieldErrors {
  Required = 'errors.customTextField.required',
  MaxLength = 'errors.customTextField.maxLength',
  EmailFormat = 'errors.customTextField.emailFormat',
  TelFormat = 'errors.customTextField.telFormat',
  PersonalIdentityCodeFormat = 'errors.customTextField.personalIdentityCodeFormat',
}

export enum HeaderTabNav {
  Register = 'register',
  ExaminationDates = 'examinationDates',
  MeetingDates = 'meetingDates',
}

export enum PermissionToPublish {
  Yes = 'Kyllä',
  No = 'Ei',
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
