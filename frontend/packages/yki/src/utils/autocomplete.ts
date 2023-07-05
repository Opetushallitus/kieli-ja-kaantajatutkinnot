import { ComboBoxOption } from 'shared/interfaces';

import { Nationality } from 'interfaces/nationality';

export const nationalityToComboBoxOption = (
  nationality: Nationality
): ComboBoxOption => {
  return { label: nationality.name, value: nationality.code };
};
