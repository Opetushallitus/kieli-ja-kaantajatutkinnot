import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { H1, H2, HeaderSeparator, Text } from 'shared/components';
import { Color, I18nNamespace, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

const LinkButton = ({ to, label }: { to: AppRoutes; label: string }) => {
  return (
    <Link to={to} className="custom-button-link rows flex-end">
      <Button
        variant={Variant.Contained}
        color={Color.Secondary}
        className="text-transform-none"
      >
        {label}
      </Button>
    </Link>
  );
};

const LevelCard = ({
  heading,
  contents,
  linkLabel,
  linkTo,
}: {
  heading: string;
  contents: React.JSX.Element;
  linkLabel: string;
  linkTo: AppRoutes;
}) => {
  return (
    <Paper
      className="public-homepage__level-description-card rows"
      elevation={2}
    >
      <div className="rows gapped grow">
        <div className="rows gapped grow">
          <Typography component="h3" variant="h2">
            {heading}
          </Typography>
          {contents}
        </div>
        <LinkButton label={linkLabel} to={linkTo} />
      </div>
    </Paper>
  );
};

const ExcellentLevelCard = () => {
  return (
    <LevelCard
      heading="Erinomaisen taidon tutkinnot"
      contents={
        <>
          <Text>Tekstiä.</Text>
          <Text>
            Toinen kappale. Hieman pituuttakin tälle paragraaaaaafffille.
          </Text>
        </>
      }
      linkLabel="Ilmoittaudu erinomaisen taidon tutkintoihin"
      linkTo={AppRoutes.PublicExcellentLevelLanding}
    />
  );
};

const GoodAndSatisfactoryLevelCard = () => {
  return (
    <LevelCard
      heading="Hyvän ja tyydyttävän taidon tutkinnot"
      contents={
        <Text>
          Yhdellä kokeella voit osoittaa tuloksesta riippuen hyvää tai
          tyydyttävää taitoa.
        </Text>
      }
      linkLabel="Ota yhteyttä tutkinnon vastaanottajiin"
      linkTo={AppRoutes.PublicGoodAndSatisfactoryLevelLanding}
    />
  );
};

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
    <Container
      style={{ maxWidth: '1000px', marginLeft: 0 }}
      className="public-homepage__info-box"
    >
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
        <Text>
          <Trans
            t={translateCommon}
            i18nKey="info.previousEnrollment"
            components={[<b key="0" />, <b key="1" />]}
          ></Trans>
        </Text>
      </div>
    </Container>
  );
};

export const PublicHomePage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicHomePage',
  });
  const { isPhone } = useWindowProperties();

  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <Grid item className="public-homepage__grid-container__item-header">
          <H1 data-testid="public-homepage__title-heading">{t('title')}</H1>
          <HeaderSeparator />
          <div className="rows gapped">
            <Text>
              {t('description.part1')}
              <br />
              {t('description.part2')}
            </Text>
            <H2>{t('selectExamination.heading')}</H2>
            <Text>{t('selectExamination.description')}</Text>
            <DescriptionBox />
            <div
              className={`public-homepage__cards gapped-xxl ${
                isPhone ? 'rows' : 'columns'
              }`}
            >
              <ExcellentLevelCard />
              <GoodAndSatisfactoryLevelCard />
            </div>
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};
