import {
  Collapse,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { CustomTextField, Text } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';

export const PreviousEnrollment = ({
  enrollment,
  editingDisabled,
}: {
  enrollment: PublicEnrollment;
  editingDisabled: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.previousEnrollment',
  });

  const yes = 'yes';
  const no = 'no';
  const dispatch = useAppDispatch();
  const [hasPreviousEnrollment, setHasPreviousEnrollment] = useState(null);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(
      updatePublicEnrollment({
        previousEnrollment: event.target.value,
      })
    );
  };

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHasPreviousEnrollment(event.target.value);
  };

  return (
    <div className="public-enrollment__grid__previous-enrollment rows gapped">
      <Text>{t('description')}</Text>
      <FormControl>
        <RadioGroup
          name="controlled-radio-buttons-group"
          value={hasPreviousEnrollment}
          onChange={handleRadioButtonChange}
        >
          <div className="columns">
            <FormControlLabel
              disabled={editingDisabled}
              value={yes}
              control={<Radio />}
              label={'Kyllä'}
              checked={hasPreviousEnrollment === yes}
            />
            <FormControlLabel
              disabled={editingDisabled}
              value={no}
              control={<Radio />}
              label={'Ei'}
              checked={hasPreviousEnrollment === no}
            />
          </div>
        </RadioGroup>
      </FormControl>
      <Collapse orientation="vertical" in={hasPreviousEnrollment === yes}>
        <CustomTextField
          label={t('label')}
          value={enrollment.previousEnrollment}
          onChange={handleChange}
          disabled={editingDisabled}
        />
      </Collapse>
    </div>
  );
};
