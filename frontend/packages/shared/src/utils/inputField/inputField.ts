import { isValid as isValidFinnishPIC } from 'finnish-personal-identity-code-validator';
import { TFunction } from 'i18next';

import { CustomTextFieldErrors, TextFieldTypes } from '../../enums';
import { TextField } from '../../interfaces';

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
  t: TFunction;
  dirtyFields?: Array<keyof T>;
  extraValidation?: ValidationFn<T>;
}

type HasErrorsParams<T> = Omit<GetErrorsParams<T>, 'dirtyFields'>;

type ValidationFn<T> = (
  errors: FieldErrors<T>,
  values: T,
  dirtyFields?: Array<keyof T>
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
    dirtyFields: undefined,
    extraValidation,
  });

  return Object.keys(errors).some(
    (field: string) => errors[field as keyof T] !== null
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
      minLength
    );
  }

  static inspectCustomTextFieldErrors(
    type: TextFieldTypes,
    value?: string,
    required = true,
    maxTextAreaLength = this.defaultMaxTextAreaLength,
    minLength?: number
  ) {
    const trimmedValue = value?.trim() || '';

    if (required && trimmedValue.length <= 0) {
      return CustomTextFieldErrors.Required;
    }

    if (!required && trimmedValue.length == 0) {
      return '';
    }

    if (minLength && minLength > 0 && trimmedValue.length < minLength) {
      return CustomTextFieldErrors.MinLength;
    }

    switch (type) {
      case TextFieldTypes.Textarea:
        if (trimmedValue.length > maxTextAreaLength) {
          return CustomTextFieldErrors.MaxLength;
        }
        break;
      case TextFieldTypes.Email:
        if (!InputFieldUtils.EMAIL_REG_EXR.test(trimmedValue)) {
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
    }

    return '';
  }

  private static EMAIL_REG_EXR = /^.+@.+\..+$/;
  private static TEL_REG_EXR = /\d{7,14}$/;
}
