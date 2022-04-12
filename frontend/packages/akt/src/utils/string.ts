export class StringUtils {
  /**
   * Value is a blank string  if its trimmed length is zero.
   */
  static isBlankString(value?: string) {
    return StringUtils.isString(value) && value?.trim().length === 0;
  }

  static isString(value: unknown): value is string {
    return typeof value === 'string' || value instanceof String;
  }
}
