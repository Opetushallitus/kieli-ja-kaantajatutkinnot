import { useEffect, useState } from 'react';
import { H2, Text } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { RegistrationKind } from 'enums/app';
import { CommonRegistrationDetails } from 'features/registration/components/steps/register/CommonRegistrationDetailsv2';
import { EmailRegistrationDetails } from 'features/registration/components/steps/register/EmailRegistrationDetailsv2';
import { SuomiFiRegistrationDetails } from 'features/registration/components/steps/register/SuomiFiRegistrationDetailsv2';
import { PublicRegistrationErrors } from 'features/registration/hooks/usePublicRegistrationErrorsv2';
import {
  registrationSelector,
  useAppDispatch,
  useAppSelector,
} from 'features/registration/state/reduxv2';
import { loadNationalities } from 'redux/reducers/nationalities';
import { nationalitiesSelector } from 'redux/selectors/nationalities';
import { publicFreeRegistrationSelector } from 'redux/selectors/publicFreeRegistration';

export const SubmitRegistrationDetails = () => {
  const dispatch = useAppDispatch();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
  });
  const { showErrors, isEmailRegistration } =
    useAppSelector(registrationSelector);
  const { isFree } = useAppSelector(publicFreeRegistrationSelector);
  const { registrationKind } =
    useAppSelector(registrationSelector).initRegistration;
  const nationalitiesStatus = useAppSelector(nationalitiesSelector).status;

  useEffect(() => {
    if (nationalitiesStatus === APIResponseStatus.NotStarted) {
      dispatch(loadNationalities());
    }
  }, [dispatch, nationalitiesStatus]);

  const [dirtyFields, setDirtyFields] = useState<
    Array<keyof PublicRegistrationErrors>
  >([]);

  const setDirtyField = (fieldName: keyof PublicRegistrationErrors) =>
    setDirtyFields([...dirtyFields, fieldName]);

  const hasErrors = (
    registrationErrors: PublicRegistrationErrors,
    fieldName: keyof PublicRegistrationErrors,
  ) => {
    return (
      (showErrors || dirtyFields.includes(fieldName)) &&
      !!registrationErrors[fieldName as keyof PublicRegistrationErrors]
    );
  };

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>{t('title')}</H2>
      <Text>
        {t('description1')}
        {isEmailRegistration && (
          <>
            <br />
            {t('description2')}
          </>
        )}
      </Text>
      <Text>{t('requiredFields')}</Text>
      {isEmailRegistration ? (
        <EmailRegistrationDetails
          setDirtyField={setDirtyField}
          hasErrors={hasErrors}
        />
      ) : (
        <SuomiFiRegistrationDetails
          setDirtyField={setDirtyField}
          hasErrors={hasErrors}
        />
      )}
      <CommonRegistrationDetails />
      <H2 className="public-registration__grid__form-container__whats-next">
        {t('whatsNext.title')}
      </H2>
      {registrationKind === RegistrationKind.Admission && isFree !== 'YES' && (
        <Text>{t('whatsNext.description')}</Text>
      )}
      {registrationKind === RegistrationKind.Admission && isFree === 'YES' && (
        <Text>{t('whatsNext.freeRegistration.description')}</Text>
      )}
      {registrationKind === RegistrationKind.Queue && isFree !== 'YES' && (
        <>
          <Text>{t('whatsNext.queued.part1')}</Text>
          <Text>{t('whatsNext.queued.part2')}</Text>
        </>
      )}
      {registrationKind === RegistrationKind.Queue && isFree === 'YES' && (
        <>
          <Text>{t('whatsNext.freeRegistration.queued.part1')}</Text>
          <Text>{t('whatsNext.freeRegistration.queued.part2')}</Text>
        </>
      )}
    </div>
  );
};
