export enum APIResponseStatus {
  NotStarted = 'NOT_STARTED',
  InProgress = 'IN_PROGRESS',
  Success = 'SUCCESS',
  Error = 'ERROR',
  Cancelled = 'CANCELLED',
}

export enum AppLanguage {
  Finnish = 'fi-FI',
  Swedish = 'sv-SE',
  English = 'en-GB',
}

export enum Color {
  Primary = 'primary',
  Secondary = 'secondary',
  Inherit = 'inherit',
  Error = 'error',
  Warning = 'warning',
}

export enum CustomTextFieldErrors {
  Required = 'errors.customTextField.required',
  MaxLength = 'errors.customTextField.maxLength',
  EmailFormat = 'errors.customTextField.emailFormat',
  TelFormat = 'errors.customTextField.telFormat',
  PersonalIdentityCodeFormat = 'errors.customTextField.personalIdentityCodeFormat',
}

export enum Direction {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum Duration {
  Short = 3000,
  Medium = 6000,
  MediumExtra = 9000,
  Long = 12000,
}

export enum HTTPStatusCode {
  Ok = 200,
  Created = 201,
  Accepted = 202,
  NoContent = 204,
  MovedPermanently = 301,
  Found = 302,
  NotModified = 304,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
}

export enum I18nNamespace {
  Accessibility = 'accessibility',
  Common = 'common',
  KoodistoLanguages = 'koodistoLanguages',
  KoodistoRegions = 'koodistoRegions',
  Privacy = 'privacy',
  Translation = 'translation',
}

export enum KeyboardKey {
  Enter = 'Enter',
}

export enum NotifierTypes {
  Dialog = 'dialog',
  Toast = 'toast',
}

export enum Screenwidth {
  Phone = 480,
  Tablet = 800,
  Desktop = 1024,
}

export enum Severity {
  Info = 'info',
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
}

export enum SkeletonVariant {
  Text = 'text',
  Rectangular = 'rectangular',
  Circular = 'circular',
}

export enum TextFieldTypes {
  Text = 'text',
  Email = 'email',
  PhoneNumber = 'tel',
  Textarea = 'textarea',
  PersonalIdentityCode = 'personalIdentityCode',
}

export enum TextFieldVariant {
  Filled = 'filled',
  Outlined = 'outlined',
  Standard = 'standard',
}

export enum Variant {
  Text = 'text',
  Outlined = 'outlined',
  Contained = 'contained',
}
