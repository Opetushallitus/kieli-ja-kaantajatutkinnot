import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { TextFieldVariant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { ExamLanguage } from 'enums/app';

export const LanguageFilter = ({
  value,
  onChange,
}: {
  value: ExamLanguage;
  onChange: (event: SelectChangeEvent) => void;
}) => {
  const translateCommon = useCommonTranslation();

  return (
    <Select
      data-testid="exam-events__language-filter"
      variant={TextFieldVariant.Standard}
      value={value}
      onChange={onChange}
    >
      {Object.entries(ExamLanguage).map(([key, language]) => {
        return (
          <MenuItem key={key} value={language}>
            {translateCommon(`languageFilter.${key}`)}
          </MenuItem>
        );
      })}
    </Select>
  );
};
