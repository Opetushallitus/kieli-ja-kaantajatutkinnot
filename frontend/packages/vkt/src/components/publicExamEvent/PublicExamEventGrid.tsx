import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Container, Grid, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { H1, H2, HeaderSeparator, Text, WebLink } from 'shared/components';
import { I18nNamespace } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PublicExamEventListing } from 'components/publicExamEvent/listing/PublicExamEventListing';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { resetPublicEnrollment } from 'redux/reducers/publicEnrollment';
import { loadPublicExamEvents } from 'redux/reducers/publicExamEvent';
import { publicExamEventsSelector } from 'redux/selectors/publicExamEvent';

const BoldedTranslationString = ({
  i18nKey,
  t,
}: {
  i18nKey: string;
  t: TFunction<I18nNamespace, string>;
}) => {
  return <Trans i18nKey={i18nKey} t={t} components={[<b key={i18nKey} />]} />;
};

const BulletList = ({
  keyPrefix,
  points,
}: {
  keyPrefix: string;
  points: Array<string>;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix,
  });

  return (
    <Typography className="margin-top-sm" variant="body1" component="ul">
      {points.map((point, i) => (
        <li key={i}>
          <BoldedTranslationString i18nKey={point} t={t} />
        </li>
      ))}
    </Typography>
  );
};

const DescriptionBox = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventGrid.description',
  });
  const translateCommon = useCommonTranslation();

  return (
    <Container className="public-homepage__info-box">
      <div className="rows gapped">
        <H2>{t('title')}</H2>
        <div className="rows">
          <Text>{t('skills')}</Text>
          <BulletList
            keyPrefix="vkt.component.publicExamEventGrid.description.bulletPoints"
            points={['point1', 'point2', 'point3']}
          />
        </div>

        <Text>{translateCommon('info.selectExam')}</Text>
        <Text>{translateCommon('info.previousEnrollment')}</Text>
      </div>
    </Container>
  );
};

const FreeExaminationBox = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventGrid.freeExamination',
  });

  return (
    <Container className="public-homepage__info-box">
      <div className="rows gapped">
        <H2>{t('title')}</H2>
        <Text>
          <BoldedTranslationString i18nKey="conditions.part1" t={t} />{' '}
          <WebLink
            href={t('conditions.link.url')}
            label={t('conditions.link.label')}
            endIcon={<OpenInNewIcon />}
          />
        </Text>
        <Text>
          <BoldedTranslationString i18nKey="conditions.part2" t={t} />
        </Text>
        <div className="rows">
          <Text>
            <BoldedTranslationString
              i18nKey="ineligibility.description"
              t={t}
            />{' '}
          </Text>
          <BulletList
            keyPrefix="vkt.component.publicExamEventGrid.freeExamination.ineligibility"
            points={['fullExaminationPayment', 'partialExaminationPayment']}
          />
        </div>
      </div>
    </Container>
  );
};

const EnrollmentBox = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventGrid.enrollment',
  });

  return (
    <Container className="public-homepage__info-box">
      <div className="rows gapped">
        <H2>{t('title')}</H2>
        <Text>
          <BoldedTranslationString i18nKey="part1" t={t} />
          <br />
          {t('part2')}
        </Text>
        <Text>
          <BoldedTranslationString i18nKey="part3" t={t} />
          <br />
          {t('part4')}
        </Text>
        <Text>
          {t('part5')}{' '}
          <WebLink
            href={t('link.url')}
            label={t('link.label')}
            endIcon={<OpenInNewIcon />}
          />
        </Text>
      </div>
    </Container>
  );
};

export const PublicExamEventGrid = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventGrid',
  });

  const dispatch = useAppDispatch();
  const { status } = useAppSelector(publicExamEventsSelector);

  const { isPhone } = useWindowProperties();

  useEffect(() => {
    dispatch(resetPublicEnrollment());
    dispatch(loadPublicExamEvents());
  }, [dispatch]);

  return (
    <>
      <Grid item className="public-homepage__grid-container__item-header">
        <H1 data-testid="public-homepage__title-heading">{t('title')}</H1>
        <HeaderSeparator />
        <div className="rows gapped">
          <Text>
            {t('introduction.line1')}
            <br />
            {t('introduction.line2')}
          </Text>
          <div
            className={
              isPhone ? 'rows gapped' : 'columns gapped-sm align-items-start'
            }
          >
            <DescriptionBox />
            <FreeExaminationBox />
            <EnrollmentBox />
          </div>
        </div>
      </Grid>
      <Grid item className="public-homepage__grid-container__result-box">
        <PublicExamEventListing status={status} />
      </Grid>
    </>
  );
};
