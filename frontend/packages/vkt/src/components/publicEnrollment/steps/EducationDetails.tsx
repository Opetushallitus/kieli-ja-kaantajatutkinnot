import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { H2, Text } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';

export const EducationDetails = ({
  handleChange,
}: {
  handleChange: (isFree: boolean) => void;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.educationDetails',
  });

  const handleRadioChange = () => {
    handleChange(true);
  };

  return (
    <div className="margin-top-lg rows gapped">
      <H2>Koulutustiedot</H2>
      <fieldset className="public-enrollment__grid__education-details">
        <legend>
          <Text>
            <b>{t('education')}</b>
          </Text>
        </legend>
        <FormControl error={false}>
          <RadioGroup onChange={handleRadioChange}>
            <FormControlLabel
              className="radio-group-label"
              value={'1'}
              control={<Radio />}
              label={t('no')}
            />
            <FormControlLabel
              className="radio-group-label"
              value={'2'}
              control={<Radio />}
              label={t('highschool')}
            />
            <FormControlLabel
              className="radio-group-label"
              value={'3'}
              control={<Radio />}
              label={t('college')}
            />
            <FormControlLabel
              className="radio-group-label"
              value={'4'}
              control={<Radio />}
              label={t('collegeEnrolled')}
            />
          </RadioGroup>
        </FormControl>
      </fieldset>
    </div>
  );
};
