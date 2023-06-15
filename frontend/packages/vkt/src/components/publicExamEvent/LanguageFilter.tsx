import {
  FormControlLabel,
  Radio,
  RadioGroup,
  SelectChangeEvent,
} from '@mui/material';

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
    <RadioGroup
      data-testid="exam-events__language-filter"
      name="language-filter"
      value={value}
      onChange={onChange}
    >
      <div className="columns margin-top-sm">
        {Object.entries(ExamLanguage).map(([key, language]) => {
          return (
            <FormControlLabel
              key={key}
              value={language}
              checked={value === language}
              label={translateCommon(`languageFilter.${key}`)}
              control={<Radio />}
            />
          );
        })}
      </div>
    </RadioGroup>
  );
};
