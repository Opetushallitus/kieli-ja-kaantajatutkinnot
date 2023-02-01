import { ChangeEvent, useState } from 'react';
import { CustomTextField, Text } from 'shared/components';
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
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.previousEnrollment',
  });
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { type, value, required } = event.target;
    const error = InputFieldUtils.inspectCustomTextFieldErrors(
      type as TextFieldTypes,
      value,
      required,
      255
    );

    const errorMessage = error ? translateCommon(error) : '';

    setErrorMessage(errorMessage);

    dispatch(
      updatePublicEnrollment({
        previousEnrollment: event.target.value,
      })
    );
  };

  return (
    <div className="public-enrollment__grid__previous-enrollment rows gapped">
      <Text>{t('description')}</Text>
      <CustomTextField
        label={t('label')}
        value={enrollment.previousEnrollment || ''}
        onChange={handleChange}
        disabled={editingDisabled}
        error={!!errorMessage}
        helperText={errorMessage}
      />
    </div>
  );
};
