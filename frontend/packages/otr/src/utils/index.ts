import { isValid as isValidFinnishPIC } from 'finnish-personal-identity-code-validator';
import { TFunction } from 'i18next';
import { TextFieldTypes } from 'shared/enums';

import { CustomTextFieldErrors } from 'enums/app';

export class Utils {
  static scrollToTop() {
    window.scrollTo({ top: 0, left: 0 });
  }

  static createMapFromArray(
    array: Array<string>,
    t: TFunction | undefined = undefined,
    prefix: string | undefined = undefined
  ) {
    const prfxKey = prefix ? `${prefix}.` : '';

    return new Map(array.map((i) => [t ? `${t(`${prfxKey}${i}`)}` : i, i]));
  }

  static createUniqueId() {
    const date = new Date().getTime().toString(36);
    const random = Math.random().toString(26).slice(2);

    return `${date}-${random}`;
  }

  static getMaxTextAreaLength = () => 6000;

  static inspectCustomTextFieldErrors(
    type: TextFieldTypes,
    value?: string,
    required = true
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
        if (trimmedValue.length > Utils.getMaxTextAreaLength()) {
          return CustomTextFieldErrors.MaxLength;
        }
        break;
      case TextFieldTypes.Email:
        if (!Utils.EMAIL_REG_EXR.test(trimmedValue)) {
          return CustomTextFieldErrors.EmailFormat;
        }
        break;
      case TextFieldTypes.PhoneNumber:
        if (!Utils.TEL_REG_EXR.test(trimmedValue)) {
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
