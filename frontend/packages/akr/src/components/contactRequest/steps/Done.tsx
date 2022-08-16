import { useEffect } from 'react';
import { CustomButton, H2, Text } from 'shared/components';
import { Duration } from 'shared/enums';

import { StepHeading } from 'components/contactRequest/ContactRequestFormUtils';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { ContactRequestFormStep } from 'enums/contactRequest';
import { concludeContactRequest } from 'redux/reducers/contactRequest';

export const Done = () => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.contactRequestForm.doneStep',
  });
  const translateCommon = useCommonTranslation();

  // Redux
  const dispatch = useAppDispatch();

  const resetAndRedirect = () => {
    dispatch(concludeContactRequest());
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      resetAndRedirect();
    }, Duration.MediumExtra);

    return () => clearTimeout(timer);
  });

  return (
    <div className="rows">
      <StepHeading step={ContactRequestFormStep.Done} />
      <div className="rows gapped">
        <div className="rows gapped">
          <H2>{t('title')}</H2>
          <Text>{t('description')}</Text>
          <CustomButton
            className="align-self-start margin-top-xxl"
            color="secondary"
            variant="contained"
            onClick={resetAndRedirect}
            data-testid="contact-request-page__homepage-btn"
          >
            {translateCommon('frontPage')}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};
