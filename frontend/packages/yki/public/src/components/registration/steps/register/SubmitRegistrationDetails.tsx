import { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { H2, Text } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { CommonRegistrationDetails } from 'components/registration/steps/register/CommonRegistrationDetails';
import { ConfirmRegistration } from 'components/registration/steps/register/ConfirmRegistration';
import { EmailRegistrationDetails } from 'components/registration/steps/register/EmailRegistrationDetails';
import { DialogContents } from 'components/registration/steps/register/RegistrationNavigationProtectionDialog';
import { SuomiFiRegistrationDetails } from 'components/registration/steps/register/SuomiFiRegistrationDetails';
import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { RegistrationKind } from 'enums/app';
import { PublicRegistrationFormSubmitError } from 'enums/publicRegistration';
import { useRegistrationNavigationProtection } from 'hooks/useNavigationProtection';
import { PublicRegistrationErrors } from 'hooks/usePublicRegistrationErrors';
import { loadLoginLink, resetLoginLink } from 'redux/reducers/loginLink';
import { loadNationalities } from 'redux/reducers/nationalities';
import { loginLinkSelector } from 'redux/selectors/loginLink';
import { nationalitiesSelector } from 'redux/selectors/nationalities';
import { publicFreeRegistrationSelector } from 'redux/selectors/publicFreeRegistration';
import { registrationSelector } from 'redux/selectors/registration';
import { sessionSelector } from 'redux/selectors/session';
import { SerializationUtils } from 'utils/serialization';

const FillRegistrationDetails = () => {
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

const AlreadyRegisteredError = () => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'yki.component.registration.registrationFormSubmitted.error.alreadyRegistered',
  });

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>{t('title')}</H2>
      <Text>{t('part1')}</Text>
      <Text>{t('part2')}</Text>
      <Text>{t('part3')}</Text>
    </div>
  );
};

const Error = () => {
  const translateCommon = useCommonTranslation();
  const { error } = useAppSelector(registrationSelector).submitRegistration;

  if (error === PublicRegistrationFormSubmitError.AlreadyRegistered) {
    return <AlreadyRegisteredError />;
  }

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>
        {error
          ? translateCommon(`errors.registration.${error}`)
          : translateCommon('error')}
      </H2>
    </div>
  );
};

const SuccessQueued = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationFormSubmitted.queued',
  });

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>{t('title')}</H2>
      <Text>{t('text1')}</Text>
      <Text>{t('text2')}</Text>
    </div>
  );
};

const SuccessRegistered = () => {
  const dispatch = useAppDispatch();

  const [searchParams] = useSearchParams();
  const registrationId = searchParams.get('registrationId');

  const { loggedInSession } = useAppSelector(sessionSelector);
  const { code } = useAppSelector(registrationSelector).submitRegistration;
  const { expires_at, status } = useAppSelector(loginLinkSelector);
  const lang = getCurrentLang();

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted && code) {
      dispatch(loadLoginLink(code));
    }
  }, [code, status, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetLoginLink());
    };
  }, [dispatch]);

  if (!code) {
    return null;
  }

  const paymentUrl = new URL(
    APIEndpoints.LoginWithCode,
    window.location.origin,
  );
  const queryParams = paymentUrl.searchParams;
  queryParams.append('code', code);
  queryParams.append('lang', SerializationUtils.serializeAppLanguage(lang));

  const paymentDetails = {
    due_date: expires_at as Dayjs,
    payment_url:
      loggedInSession &&
      loggedInSession['auth-method'] === 'SUOMIFI' &&
      registrationId
        ? APIEndpoints.RedirectToPayment.replace(
            /:registrationId/,
            registrationId,
          ).replace(/:lang/, SerializationUtils.serializeAppLanguage(lang))
        : paymentUrl.toString(),
  };

  return <ConfirmRegistration paymentDetails={paymentDetails} />;
};

const Success = () => {
  const { registrationKind } =
    useAppSelector(registrationSelector).submitRegistration;

  if (registrationKind === RegistrationKind.Admission) {
    return <SuccessRegistered />;
  } else {
    return <SuccessQueued />;
  }
};

export const SubmitRegistrationDetails = () => {
  const { status } = useAppSelector(registrationSelector).submitRegistration;
  const { hasTimerExpired } = useAppSelector(registrationSelector);
  useRegistrationNavigationProtection(
    !hasTimerExpired && status !== APIResponseStatus.Success,
    <DialogContents />,
  );

  switch (status) {
    case APIResponseStatus.NotStarted:
    case APIResponseStatus.InProgress:
      return <FillRegistrationDetails />;
    case APIResponseStatus.Cancelled:
    case APIResponseStatus.Error:
      return <Error />;
    case APIResponseStatus.Success:
      return <Success />;
  }
};
