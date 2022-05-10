export enum AppConstants {
  CallerID = '1.2.246.562.10.00000000001.otr',
}

export enum AppRoutes {
  PublicHomePage = '/otr/etusivu',
  AccessibilityStatementPage = '/otr/saavutettavuusseloste',
  NotFoundPage = '*',
}

export enum SearchFilter {
  FromLang = 'fromLang',
  ToLang = 'toLang',
  Name = 'name',
  Area = 'area',
}

export enum PublicUIViews {
  PublicTranslatorListing = 'PublicTranslatorListing',
  ContactRequest = 'ContactRequest',
}

export enum CustomTextFieldErrors {
  Required = 'errors.customTextField.required',
  MaxLength = 'errors.customTextField.maxLength',
  EmailFormat = 'errors.customTextField.emailFormat',
  TelFormat = 'errors.customTextField.telFormat',
  PersonalIdentityCodeFormat = 'errors.customTextField.personalIdentityCodeFormat',
}

// TODO: check this
export enum UIMode {
  View = 'view',
  EditTranslatorDetails = 'editTranslatorDetails',
  EditAuthorisationDetails = 'editAuthorisationDetails',
}
