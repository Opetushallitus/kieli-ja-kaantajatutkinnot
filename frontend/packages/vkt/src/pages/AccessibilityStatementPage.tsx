import { ArrowBackIosOutlined as ArrowBackIosOutlinedIcon } from '@mui/icons-material';
import { Grid, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CustomButtonLink,
  H1,
  H2,
  H3,
  HeaderSeparator,
  Text,
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
  <Text>
    <ul>
      <li>{item}</li>
      <ul>
        {bulletPoints.map((bulletPoint, i) => (
          <li key={`${bulletPoint}-${i}`}>{bulletPoint}</li>
        ))}
      </ul>
    </ul>
  </Text>
);

export const AccessibilityStatementPage = () => {
  const translateAccessibility = useAccessibilityTranslation();
  const translateCommon = useCommonTranslation();
  const { pathname } = useLocation();

  const caveats = Object.keys(
    accessibilityFI.vkt.accessibility.content.caveats
  );
  const _feedbackEmail = translateCommon('contactEmail');

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
          <div className="accessibility-statement">
            <div className="accessibility-statement-content rows gapped-xxl">
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
                {caveats.map(({}, i) => (
                  <ItemBulletList
                    key={`items-${i}`}
                    item={translateAccessibility(`content.caveats.${i}.name`)}
                    bulletPoints={translateAccessibility(
                      `content.caveats.${i}.points`,
                      { returnObjects: true }
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};
