import { CustomTextField, CustomTextFieldProps, H3 } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PersonFillOutDetails } from 'interfaces/publicRegistration';
import { examSessionSelector } from 'redux/selectors/examSession';

export const PersonDetails = ({
  getCustomTextFieldAttributes,
}: {
  getCustomTextFieldAttributes: (
    fieldName: keyof PersonFillOutDetails
  ) => CustomTextFieldProps;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.personDetails',
  });

  const { registration } = useAppSelector(examSessionSelector);

  return (
    <div className="rows gapped">
      <H3>{t('title')}</H3>
      <div className="grid-columns gapped">
        <CustomTextField
          {...getCustomTextFieldAttributes('firstNames')}
          value={registration.firstNames}
        />
        <CustomTextField
          {...getCustomTextFieldAttributes('lastName')}
          value={registration.lastName}
        />
      </div>
      <div className="grid-columns gapped">
        <CustomTextField
          {...getCustomTextFieldAttributes('address')}
          value={registration.address}
        />
        <CustomTextField
          {...getCustomTextFieldAttributes('postNumber')}
          value={registration.postNumber}
        />
        <CustomTextField
          {...getCustomTextFieldAttributes('postOffice')}
          value={registration.postOffice}
        />
      </div>
    </div>
  );
};
