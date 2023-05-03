import {
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { TextFieldVariant } from 'shared/enums';
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

  const renderPhoneFilter = () => {
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

  const renderDesktopFilter = () => {
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

  return isPhone ? renderPhoneFilter() : renderDesktopFilter();
};
