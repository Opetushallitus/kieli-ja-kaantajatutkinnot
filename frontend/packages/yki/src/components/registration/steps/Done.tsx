import { useEffect } from 'react';
import { H2, Text } from 'shared/components';
import { Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
//import { PublicRegistrationFormStep } from 'enums/publicRegistration';
//import { resetPublicRegistration } from 'redux/reducers/registration';
import { registrationSelector } from 'redux/selectors/registration';

export const Done = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.done',
  });

  const { registration } = useAppSelector(registrationSelector);
  //const dispatch = useAppDispatch();
  const { showToast } = useToast();

  useEffect(() => {
    showToast({
      severity: Severity.Success,
      description: t('successToast'),
    });

    // TODO Clean-up on unmount
    /* return () => {
      if (activeStep === PublicRegistrationFormStep.Done) {
        dispatch(resetPublicRegistration());
      }
    };
    */
  }, [t, showToast]);

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>{t('title')}</H2>
      <Text>
        <strong>{`${t('description.part1')}: ${registration.email}`}</strong>
      </Text>
      <Text>{t('description.part2')}</Text>
    </div>
  );
};
