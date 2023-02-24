import { isValid as isValidFinnishPIC } from 'finnish-personal-identity-code-validator';

import { TextField } from '../../interfaces';
import { CustomTextFieldErrors, TextFieldTypes } from '../../enums';

export function getErrors<T> (
    fields: TextField<T>[],
    values: T,
    t: (key: string) => string
  ): T {
    return fields.reduce(
      (fields, field: TextField<T>) => {
        const value = String(values[field.name]);
        const error = InputFieldUtils.inspectCustomTextFieldErrors(
          field.type,
          value,
          field.required
        );
        const fieldErrorMessage = error ? t(error) : '';

        return {
          ...fields,
          [field.name]: fieldErrorMessage,
        };
      },
      {} as T
    );
}

export function getEmptyErrorState<T> (
    fields: TextField<T>[],
  ): T {
    return fields.reduce(
      (fields, field: TextField<T>) => {
        return {
          ...fields,
          [field.name]: '',
        };
      },
      {} as T
    );
}

export class InputFieldUtils {
  static defaultMaxTextAreaLength = 6000;

  static inspectCustomTextFieldErrors(
    type: TextFieldTypes,
    value?: string,
    required = true,
    maxTextAreaLength = this.defaultMaxTextAreaLength
  ) {
    const trimmedValue = value?.trim() || '';

    if (required && trimmedValue.length <= 0) {
      return CustomTextFieldErrors.Required;
    }

    if (!required && trimmedValue.length == 0) {
      return '';
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
