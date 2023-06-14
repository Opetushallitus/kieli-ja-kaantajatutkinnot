import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link } from '@mui/material';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { H2, Text } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { CommonRegistrationDetails } from 'components/registration/steps/register/CommonRegistrationDetails';
import { EmailRegistrationDetails } from 'components/registration/steps/register/EmailRegistrationDetails';
import { SuomiFiRegistrationDetails } from 'components/registration/steps/register/SuomiFiRegistrationDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadNationalities } from 'redux/reducers/nationalities';
import { nationalitiesSelector } from 'redux/selectors/nationalities';
import { registrationSelector } from 'redux/selectors/registration';

const FillRegistrationDetails = () => {
  const dispatch = useAppDispatch();
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationDetails',
  });
  const { isEmailRegistration } = useAppSelector(registrationSelector);
  const { status: nationalitiesStatus } = useAppSelector(nationalitiesSelector);
  useEffect(() => {
    if (nationalitiesStatus === APIResponseStatus.NotStarted) {
      dispatch(loadNationalities());
    }
  }, [dispatch, nationalitiesStatus]);

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>{t('title')}</H2>
      <Text>
        {t('description1')}
        <br />
        {t('description2')}
      </Text>
      {isEmailRegistration ? (
        <EmailRegistrationDetails />
      ) : (
        <SuomiFiRegistrationDetails />
      )}
      <CommonRegistrationDetails />
      <H2>{t('whatsNext.title')}</H2>
      <Text>{t('whatsNext.description1')}</Text>
      <Text>
        {t('whatsNext.description2')}
        <br />
        {t('whatsNext.description3')}:
        <br />
        <div className="columns gapped-xxs">
          <Link
            href={translateCommon('specialArrangementsLink')}
            target="_blank"
          >
            {t('whatsNext.linkLabel')}
          </Link>
          <OpenInNewIcon />
        </div>
      </Text>
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
  const { registration } = useAppSelector(registrationSelector);
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.registrationFormSubmitted',
  });

  return (
    <div className="margin-top-xxl rows gapped">
      <H2>{t('title')}</H2>
      <H2>{t('whatsNext.title')}</H2>
      <Text>
        <Trans
          t={t}
          i18nKey={'whatsNext.description1'}
          email={registration.email}
        >
          {registration.email}
        </Trans>
      </Text>
      <Text>
        <Trans t={t} i18nKey={'whatsNext.description2'} />
        <br />
        {t('whatsNext.description3')}
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
