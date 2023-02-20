import {
  Collapse,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { ChangeEvent } from 'react';
import { CustomTextField } from 'shared/components';

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
    dispatch(
      updatePublicEnrollment({
        hasPreviousEnrollment: event.target.value == yes,
      })
    );
  };

  return (
    <div className="public-enrollment__grid__previous-enrollment rows gapped">
      <FormControl error={true}>
        <FormLabel id="demo-error-radios">{t('description')}</FormLabel>
        <RadioGroup
          name="controlled-radio-buttons-group"
          value={enrollment.hasPreviousEnrollment ? yes : no}
          onChange={handleRadioButtonChange}
        >
          <div className="columns">
            <FormControlLabel
              disabled={editingDisabled}
              value={yes}
              control={<Radio />}
              label={'Kyllä'}
              checked={enrollment.hasPreviousEnrollment}
            />
            <FormControlLabel
              disabled={editingDisabled}
              value={no}
              control={<Radio />}
              label={'Ei'}
              checked={enrollment.hasPreviousEnrollment === false}
            />
          </div>
        </RadioGroup>
      </FormControl>
      <Collapse orientation="vertical" in={enrollment.hasPreviousEnrollment}>
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
