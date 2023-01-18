import { ChangeEvent } from 'react';
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

  const dispatch = useAppDispatch();

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(
      updatePublicEnrollment({
        previousEnrollment: event.target.value,
      })
    );
  };

  return (
    <div className="public-enrollment__grid__previous-enrollment rows gapped-sm">
      <Text>{t('description')}</Text>
      <CustomTextField
        label={t('label')}
        value={enrollment.previousEnrollment}
        onChange={handleChange}
        disabled={editingDisabled}
      />
    </div>
  );
};
