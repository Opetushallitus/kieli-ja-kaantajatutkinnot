import { ComboBoxOption } from 'shared/interfaces';

import { CodeElement } from 'interfaces/code';

export const codeElementToComboBoxOption = (
  codeElement: CodeElement,
): ComboBoxOption => {
  return { label: codeElement.name, value: codeElement.code };
};
