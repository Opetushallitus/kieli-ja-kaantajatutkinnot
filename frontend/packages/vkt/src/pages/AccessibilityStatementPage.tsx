import { ArrowBackIosOutlined as ArrowBackIosOutlinedIcon } from '@mui/icons-material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Grid, Paper, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CustomButtonLink,
  H1,
  H2,
  H3,
  HeaderSeparator,
  Text,
  WebLink,
} from 'shared/components';
import { Variant } from 'shared/enums';
import { CommonUtils } from 'shared/utils';

import {
  useAccessibilityTranslation,
  useCommonTranslation,
} from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import accessibilityFI from 'public/i18n/fi-FI/accessibility.json';

const BackButton = () => {
  const translateCommon = useCommonTranslation();

  return (
    <CustomButtonLink
      to={AppRoutes.PublicHomePage}
      variant={Variant.Text}
      startIcon={<ArrowBackIosOutlinedIcon />}
      className="color-secondary-dark"
    >
      {translateCommon('backToHomePage')}
    </CustomButtonLink>
  );
};

const ItemBulletList = ({
  item,
  bulletPoints,
}: {
  item: string;
  bulletPoints: Array<string>;
}) => (
  <Typography variant="body1" component="li">
    {item}
    <ul>
      {bulletPoints.map((bulletPoint, i) => (
        <Typography key={`${bulletPoint}-${i}`} variant="body1" component="li">
          {bulletPoint}
        </Typography>
      ))}
    </ul>
  </Typography>
);

export const AccessibilityStatementPage = () => {
  const translateAccessibility = useAccessibilityTranslation();
  const translateCommon = useCommonTranslation();
  const { pathname } = useLocation();

  const caveats = Object.keys(
    accessibilityFI.vkt.accessibility.content.caveats,
  );

  useEffect(() => {
    CommonUtils.scrollToTop();
  }, [pathname]);

  return (
    <Grid
      className="accessibility-statement-page"
      container
      rowSpacing={4}
      direction="column"
    >
      <Grid item className="accessibility-statement-page__back-button">
        <BackButton />
      </Grid>
      <Grid item className="accessibility-statement-page__heading">
        <H1>{translateAccessibility('heading.title')}</H1>
        <HeaderSeparator />
        <Text>{translateAccessibility('heading.description')}</Text>
      </Grid>
      <Grid item>
        <Paper className="accessibility-statement-page__content" elevation={3}>
          <div className="accessibility-statement rows gapped-xxl">
            <div className="rows gapped-xxs">
              <H2>{translateAccessibility('content.status.title')}</H2>
              <Text>
                {translateAccessibility('content.status.description')}
              </Text>
            </div>
            <div className="rows gapped-xxs">
              <H3>{translateAccessibility('content.nonAccessible.title')}</H3>
              <Text>
                {translateAccessibility('content.nonAccessible.description1')}
                {':'}
              </Text>
              <Text>
                {translateAccessibility('content.nonAccessible.description2')}
              </Text>
              <ul className="accessibility-statement-page__item-bullet-list">
                {caveats.map(({}, i) => (
                  <ItemBulletList
                    key={`items-${i}`}
                    item={translateAccessibility(`content.caveats.${i}.name`)}
                    bulletPoints={translateAccessibility(
                      `content.caveats.${i}.points`,
                      { returnObjects: true },
                    )}
                  />
                ))}
              </ul>
            </div>
            <div className="rows gapped-xxs">
              <H2>{translateAccessibility('content.composition.title')}</H2>
              <Text>
                {translateAccessibility('content.composition.description')}
              </Text>
            </div>
            <div className="rows gapped-xxs">
              <H2>{translateAccessibility('content.feedback.title')}</H2>
              <Text>
                {translateAccessibility('content.feedback.description1')}
              </Text>
              <Text>
                {translateAccessibility('content.feedback.description2')}
                {': '}
                <WebLink
                  href={`mailto:${translateCommon('contactEmail')}`}
                  label={translateCommon('contactEmail')}
                />
              </Text>
            </div>
            <div className="rows gapped">
              <div className="rows gapped-xxs">
                <H3>{translateAccessibility('content.enforcement.title')}</H3>
                <Text>
                  {translateAccessibility('content.enforcement.description')}
                </Text>
              </div>
              <div className="rows gapped-xxs">
                <H3>
                  {translateAccessibility('content.administrativeAgency.title')}
                </H3>
                <Text>
                  {translateAccessibility(
                    'content.administrativeAgency.description',
                  )}
                </Text>
                <Text>
                  <WebLink
                    href={translateAccessibility(
                      'content.administrativeAgency.link.url',
                    )}
                    label={translateAccessibility(
                      'content.administrativeAgency.link.label',
                    )}
                    endIcon={<OpenInNewIcon />}
                  />
                </Text>
                <Text>
                  <WebLink
                    href={`mailto:${translateAccessibility(
                      'content.administrativeAgency.email',
                    )}`}
                    label={translateAccessibility(
                      'content.administrativeAgency.email',
                    )}
                  />
                </Text>
                <Text>
                  {translateAccessibility(
                    'content.administrativeAgency.switchboard',
                  )}
                  {': '}
                  {translateAccessibility('content.administrativeAgency.phone')}
                </Text>
              </div>
            </div>
            <div className="rows gapped-xxs">
              <H2>{translateAccessibility('content.furtherImprove.title')}</H2>
              <Text>
                {translateAccessibility('content.furtherImprove.description1')}
              </Text>
              <Text>
                {translateAccessibility('content.furtherImprove.description2')}
              </Text>
            </div>
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};
