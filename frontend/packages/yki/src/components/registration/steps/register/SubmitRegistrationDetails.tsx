import { Dayjs } from 'dayjs';
import { useEffect } from 'react';
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
import { useRegistrationNavigationProtection } from 'hooks/useNavigationProtection';
import { loadLoginLink, resetLoginLink } from 'redux/reducers/loginLink';
import { loadNationalities } from 'redux/reducers/nationalities';
import { loginLinkSelector } from 'redux/selectors/loginLink';
import { nationalitiesSelector } from 'redux/selectors/nationalities';
import { registrationSelector } from 'redux/selectors/registration';
import { SerializationUtils } from 'utils/serialization';

const FillRegistrationDetails = () => {
  const dispatch = useAppDispatch();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
  });
  const { isEmailRegistration } = useAppSelector(registrationSelector);
  const submitRegistrationStatus =
    useAppSelector(registrationSelector).submitRegistration.status;
  const nationalitiesStatus = useAppSelector(nationalitiesSelector).status;

  useEffect(() => {
    if (nationalitiesStatus === APIResponseStatus.NotStarted) {
      dispatch(loadNationalities());
    }
  }, [dispatch, nationalitiesStatus]);

  useRegistrationNavigationProtection(
    submitRegistrationStatus === APIResponseStatus.NotStarted ||
      submitRegistrationStatus === APIResponseStatus.InProgress,
    <DialogContents />,
  );

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
        <EmailRegistrationDetails />
      ) : (
        <SuomiFiRegistrationDetails />
      )}
      <CommonRegistrationDetails />
      <H2 className="public-registration__grid__form-container__whats-next">
        {t('whatsNext.title')}
      </H2>
      <Text>{t('whatsNext.description')}</Text>
    </div>
  );
};

const Error = () => {
  const translateCommon = useCommonTranslation();
  const { error } = useAppSelector(registrationSelector).submitRegistration;

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

const Success = () => {
  const dispatch = useAppDispatch();
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

  if (!code || status !== APIResponseStatus.Success) {
    return null;
  }

  const paymentUrl = new URL(
    APIEndpoints.LoginWithCode,
    window.location.origin,
  );
  const queryParams = paymentUrl.searchParams;
  queryParams.append('code', code);
  queryParams.append('lang', SerializationUtils.serializeAppLanguage(lang));

  return (
    <ConfirmRegistration
      paymentDetails={{
        payment_url: paymentUrl.toString(),
        due_date: expires_at as Dayjs,
      }}
    />
  );
};

export const SubmitRegistrationDetails = () => {
  const { status } = useAppSelector(registrationSelector).submitRegistration;

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
