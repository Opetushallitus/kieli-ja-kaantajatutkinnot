import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  SelectChangeEvent,
} from '@mui/material';
import { useWindowProperties } from 'shared/hooks';

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
  const { isPhone } = useWindowProperties();

  return (
    <FormControl className="margin-top-lg" component="fieldset">
      <FormLabel component="legend" className="heading-label">
        {translateCommon('languageFilter.label')}:
      </FormLabel>
      <RadioGroup
        data-testid="exam-events__language-filter"
        name="language-filter"
        value={value}
        onChange={onChange}
      >
        <div className={`${isPhone ? 'rows' : 'columns'} margin-left-sm`}>
          {Object.entries(ExamLanguage).map(([key, language]) => {
            return (
              <FormControlLabel
                key={key}
                value={language}
                checked={value === language}
                label={translateCommon(`languageFilter.options.${key}`)}
                control={<Radio />}
              />
            );
          })}
        </div>
      </RadioGroup>
    </FormControl>
  );
};
