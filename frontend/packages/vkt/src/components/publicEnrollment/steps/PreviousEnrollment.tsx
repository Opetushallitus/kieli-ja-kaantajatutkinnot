import {
  Collapse,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { CustomTextField } from 'shared/components';
import { TextFieldTypes } from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
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
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.previousEnrollment',
  });

  const yes = 'yes';
  const no = 'no';
  const dispatch = useAppDispatch();
  const [fieldError, setFieldError] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(
      updatePublicEnrollment({
        previousEnrollment: event.target.value,
      })
    );
  };

  const handleErrors = (hasPreviousEnrollment: boolean) => {
    if (!hasPreviousEnrollment) {
      return false;
    }

    const error = InputFieldUtils.inspectCustomTextFieldErrors(
      TextFieldTypes.Text,
      enrollment.previousEnrollment,
      true
    );

    setFieldError(!!error);
  };

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const hasPreviousEnrollment = event.target.value == yes;

    handleErrors(hasPreviousEnrollment);

    dispatch(updatePublicEnrollment({ hasPreviousEnrollment }));
  };

  return (
    <div className="public-enrollment__grid__previous-enrollment rows gapped">
      <FormControl error={fieldError}>
        <FormLabel>{t('description')}</FormLabel>
        <RadioGroup
          name="has-previous-enrollment-group"
          value={enrollment.hasPreviousEnrollment ? yes : no}
          onChange={handleRadioButtonChange}
        >
          <div className="columns">
            <FormControlLabel
              disabled={editingDisabled}
              value={yes}
              control={<Radio />}
              label={translateCommon('yes')}
              checked={enrollment.hasPreviousEnrollment}
            />
            <FormControlLabel
              disabled={editingDisabled}
              value={no}
              control={<Radio />}
              label={translateCommon('no')}
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
