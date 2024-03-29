import { isValid as isValidFinnishPIC } from 'finnish-personal-identity-code-validator';

import { CustomTextFieldErrors, TextFieldTypes } from '../../enums';
import { TextField } from '../../interfaces';
import { DateUtils } from '../../utils';

export type FieldErrors<T> = {
  [Property in keyof T]: string;
};

interface ValidateErrorsParams {
  type: TextFieldTypes;
  value?: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
}

interface GetErrorsParams<T> {
  fields: Array<TextField<T>>;
  values: T;
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  t: any;
  dirtyFields?: Array<keyof T>;
  extraValidation?: ValidationFn<T>;
}

type HasErrorsParams<T> = Omit<GetErrorsParams<T>, 'dirtyFields'>;

type ValidationFn<T> = (
  errors: FieldErrors<T>,
  values: T,
  dirtyFields?: Array<keyof T>,
) => FieldErrors<T>;

export function hasErrors<T>({
  fields,
  values,
  t,
  extraValidation,
}: HasErrorsParams<T>): boolean {
  const errors = getErrors<T>({
    fields,
    values,
    t,
    extraValidation,
  });

  return Object.keys(errors).some(
    (field: string) => errors[field as keyof T] !== null,
  );
}

export function getErrors<T>({
  fields,
  values,
  t,
  dirtyFields,
  extraValidation,
}: GetErrorsParams<T>): FieldErrors<T> {
  const errors = fields.reduce((accum: FieldErrors<T>, field: TextField<T>) => {
    if (dirtyFields && dirtyFields.indexOf(field.name) === -1) {
      return accum;
    }

    const value = String(values[field.name]);
    const error = InputFieldUtils.validateCustomTextFieldErrors({
      type: field.type,
      value: value,
      required: field.required,
      maxLength: field.maxLength,
      minLength: field.minLength,
    });
    const fieldErrorMessage = error ? t(error) : null;

    return {
      ...accum,
      [field.name]: fieldErrorMessage,
    };
  }, {} as FieldErrors<T>);

  const extraErrors = extraValidation
    ? extraValidation(errors, values, dirtyFields)
    : ({} as FieldErrors<T>);

  return { ...errors, ...extraErrors };
}

export class InputFieldUtils {
  static defaultMaxTextAreaLength = 6000;

  static validateCustomTextFieldErrors({
    type,
    value,
    required,
    maxLength,
    minLength,
  }: ValidateErrorsParams) {
    return InputFieldUtils.inspectCustomTextFieldErrors(
      type,
      value,
      required,
      maxLength,
      minLength,
    );
  }

  static inspectCustomTextFieldErrors(
    type: TextFieldTypes,
    value?: string,
    required = true,
    maxTextLength?: number,
    minLength?: number,
  ) {
    const trimmedValue = value?.trim() || '';
    const textAreaMaxLength =
      maxTextLength ?? InputFieldUtils.defaultMaxTextAreaLength;

    if (required && trimmedValue.length <= 0) {
      return CustomTextFieldErrors.Required;
    }

    if (!required && trimmedValue.length == 0) {
      return '';
    }

    if (trimmedValue.length > textAreaMaxLength) {
      return CustomTextFieldErrors.MaxLength;
    }

    if (minLength && minLength > 0 && trimmedValue.length < minLength) {
      return CustomTextFieldErrors.MinLength;
    }

    switch (type) {
      case TextFieldTypes.Email:
        if (!InputFieldUtils.isValidEmail(trimmedValue)) {
          return CustomTextFieldErrors.EmailFormat;
        }
        break;
      case TextFieldTypes.PhoneNumber:
        if (!InputFieldUtils.TEL_REG_EXR.test(trimmedValue)) {
          return CustomTextFieldErrors.TelFormat;
        }
        break;
      case TextFieldTypes.PersonalIdentityCode:
        if (!isValidFinnishPIC(trimmedValue)) {
          return CustomTextFieldErrors.PersonalIdentityCodeFormat;
        }
        break;
      case TextFieldTypes.Date:
        if (!DateUtils.parseDateString(value)) {
          return CustomTextFieldErrors.DateFormat;
        }
    }

    return '';
  }

  static isValidEmail(email: string) {
    const emailParts = email.split('@');
    if (emailParts.length != 2) {
      return false;
    }

    const [localPart, domainPart] = emailParts;
    if (!InputFieldUtils.EMAIL_LOCAL_PART_REGEX.test(localPart)) {
      return false;
    }
    if (localPart.indexOf('..') > -1) {
      return false;
    }
    if (localPart.startsWith('.')) {
      return false;
    }
    if (localPart.endsWith('.')) {
      return false;
    }

    if (domainPart.length > 255) {
      return false;
    }
    const domainParts = domainPart.split('.');
    if (domainParts.length < 2) {
      return false;
    }
    for (const subdomain of domainParts) {
      if (!InputFieldUtils.EMAIL_SUBDOMAIN_REGEX.test(subdomain)) {
        return false;
      }
    }

    return true;
  }

  private static EMAIL_LOCAL_PART_REGEX = new RegExp(
    /^[\p{Letter}0-9!#$%&'+\-\/=\?\^_`\.\{|\}~]{1,64}$/,
    'u',
  );
  private static EMAIL_SUBDOMAIN_REGEX = new RegExp(
    /^[\p{Letter}0-9\-]{1,63}$/,
    'u',
  );
  private static TEL_REG_EXR = /\d{7,14}$/;
}
