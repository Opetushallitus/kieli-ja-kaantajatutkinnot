import { Container } from '@mui/system';
import { Link } from 'react-router-dom';
import { CustomButton, H2, H3, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { BulletList } from 'components/common/BulletList';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import {
  continueWithEnrollmentDetails,
  resetPublicEnrollmentContact,
} from 'redux/reducers/publicEnrollmentContact';

const MessageSent = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentContact.steps.done.messageSent',
  });

  return (
    <>
      <H2>{t('heading')}</H2>
      <div className="rows">
        <Text>{t('whatNext.prompt')}</Text>
        <BulletList
          t={t}
          renderListItem={(t, k) => t(k)}
          points={[
            'whatNext.step1',
            'whatNext.step2',
            'whatNext.step3',
            'whatNext.step4',
            'whatNext.step5',
          ]}
        ></BulletList>
      </div>
    </>
  );
};

const AnotherMessage = () => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollmentContact.steps.done.anotherMessage',
  });

  return (
    <>
      <H2>{t('heading')}</H2>
      <Text>{t('description')}</Text>
    </>
  );
};

const ContinueBox = () => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollmentContact.steps.done.infoBox.continue',
  });
  const dispatch = useAppDispatch();
  const retainFilledEnrollmentDetails = () => {
    dispatch(continueWithEnrollmentDetails());
  };

  return (
    <Container className="public-enrollment-contact__info-box">
      <div className="rows gapped grow">
        <H3>{t('heading')}</H3>
        <Text className="grow">{t('description')}</Text>
        <Link
          to={AppRoutes.PublicGoodAndSatisfactoryLevelLanding}
          className="flex-end"
        >
          <CustomButton
            onClick={retainFilledEnrollmentDetails}
            color={Color.Secondary}
            variant={Variant.Contained}
          >
            {t('callToAction')}
          </CustomButton>
        </Link>
      </div>
    </Container>
  );
};

const QuitBox = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentContact.steps.done.infoBox.quit',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const resetContactRequestState = () => {
    dispatch(resetPublicEnrollmentContact());
  };

  return (
    <Container className="public-enrollment-contact__info-box">
      <div className="rows gapped grow">
        <H3>{t('heading')}</H3>
        <Text className="grow">{t('description')}</Text>
        <Link
          to={AppRoutes.PublicGoodAndSatisfactoryLevelLanding}
          className="flex-end"
        >
          <CustomButton
            onClick={resetContactRequestState}
            color={Color.Secondary}
            variant={Variant.Contained}
          >
            {translateCommon('backToHomePage')}
          </CustomButton>
        </Link>
      </div>
    </Container>
  );
};

export const Done = () => {
  return (
    <div className="public-enrollment-contact margin-top-lg rows gapped">
      <MessageSent />
      <AnotherMessage />
      <div className="columns gapped">
        <ContinueBox />
        <QuitBox />
      </div>
    </div>
  );
};
