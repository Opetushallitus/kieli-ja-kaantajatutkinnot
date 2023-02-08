import { isValid as isValidFinnishPIC } from 'finnish-personal-identity-code-validator';

import { CustomTextFieldErrors, TextFieldTypes } from '../../enums';

export class InputFieldUtils {
  static defaultMaxTextAreaLength = 6000;

  static inspectCustomTextFieldErrors(
    type: TextFieldTypes,
    value?: string,
    required = true,
    maxTextLength?: number
  ) {
    const trimmedValue = value?.trim() || '';
    const textAreaMaxLength = maxTextLength ?? InputFieldUtils.defaultMaxTextAreaLength;

    if (required && trimmedValue.length <= 0) {
      return CustomTextFieldErrors.Required;
    }

    if (!required && trimmedValue.length == 0) {
      return '';
    }

    if (maxTextLength && maxTextLength > 0 && trimmedValue.length > maxTextLength) {
      return CustomTextFieldErrors.MaxLength;
    }

    switch (type) {
      case TextFieldTypes.Textarea:
        if (trimmedValue.length > textAreaMaxLength) {
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
