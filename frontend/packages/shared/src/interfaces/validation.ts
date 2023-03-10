import { TextFieldTypes } from '../enums';

export interface TextField<T> {
  name: keyof T;
  required: boolean;
  type: TextFieldTypes;
  maxLength: number;
  minLength?: number;
}
