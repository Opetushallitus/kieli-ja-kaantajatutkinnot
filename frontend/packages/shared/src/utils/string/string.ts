export class StringUtils {
  /**
   * Value is a blank string  if its trimmed length is zero.
   */
  static isBlankString(value?: string) {
    return StringUtils.isString(value) && value.trim().length === 0;
  }

  static isNonBlankString(value?: string) {
    return StringUtils.isString(value) && value.trim().length !== 0;
  }

  static isString(value: unknown): value is string {
    return typeof value === 'string' || value instanceof String;
  }

  static trimAndLowerCase = (val: string) => val.trim().toLowerCase();

  /**
   * @returns Original `value` if present and nonempty, `placeholder` (by default a single dash `-`) otherwise.
   */
  static getWithPlaceholder(value?: string, placeholder = '-') {
    return value ?? placeholder;
  }

  static capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
