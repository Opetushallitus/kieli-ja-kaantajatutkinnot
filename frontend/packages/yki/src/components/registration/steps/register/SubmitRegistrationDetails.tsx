import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { H2, Text } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { CommonRegistrationDetails } from 'components/registration/steps/register/CommonRegistrationDetails';
import { EmailRegistrationDetails } from 'components/registration/steps/register/EmailRegistrationDetails';
import { DialogContents } from 'components/registration/steps/register/RegistrationNavigationProtectionDialog';
import { SuomiFiRegistrationDetails } from 'components/registration/steps/register/SuomiFiRegistrationDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { useRegistrationNavigationProtection } from 'hooks/useNavigationProtection';
import { ExamSession } from 'interfaces/examSessions';
import { loadNationalities } from 'redux/reducers/nationalities';
import { examSessionSelector } from 'redux/selectors/examSession';
import { nationalitiesSelector } from 'redux/selectors/nationalities';
import { registrationSelector } from 'redux/selectors/registration';
import { ExamSessionUtils } from 'utils/examSession';

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
      <H2>{t('whatsNext.title')}</H2>
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
  const { examSession } = useAppSelector(examSessionSelector);
  const { t } = usePublicTranslation({
    keyPrefix:
      'yki.component.registration.registrationFormSubmitted.proceedToPayment',
  });

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>{t('title')}</H2>
      <Text>
        {t('confirmation')}:{' '}
        {ExamSessionUtils.languageAndLevelText(examSession as ExamSession)}
      </Text>
      <Text>
        {t('paymentLinkEmail.text1')}
        <br />
        {t('paymentLinkEmail.text2')}
        <br />
        {t('paymentLinkEmail.text3')}
      </Text>
      <Text>
        <Trans t={t} i18nKey={'dueDateReminder.text1'} />
        <br />
        {t('dueDateReminder.text2')}
      </Text>
    </div>
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
