import {
  ArrowBackIosOutlined as ArrowBackIosOutlinedIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { Grid, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CustomButtonLink,
  ExtLink,
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

export const AccessibilityStatementPage = () => {
  const translateAccessibility = useAccessibilityTranslation();
  const translateCommon = useCommonTranslation();
  const { pathname } = useLocation();

  const administrativeAgencyContactDetails = Object.keys(
    accessibilityFI.akt.accessibility.content.contactAdministrativeAgency
      .details
  );

  const caveats = Object.keys(
    accessibilityFI.akt.accessibility.content.caveats.items
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
      <Grid item className="accessibility-statement-page__heading">
        <H1>{translateAccessibility('heading.title')}</H1>
        <HeaderSeparator />
        <Text>{translateAccessibility('heading.description')}</Text>
      </Grid>
      <Grid item>
        <Paper
          className="accessibility-statement-page__content rows gapped-xxl"
          elevation={3}
        >
          <div>
            <BackButton />
          </div>
          <div className="rows gapped-xxs">
            <H2>{translateAccessibility('content.status.title')}</H2>
            <Text>{translateAccessibility('content.status.description')}</Text>
          </div>
          <div className="rows gapped-xxs">
            <H2>{translateAccessibility('content.nonAccessible.title')}</H2>
            <H3>
              {translateAccessibility('content.nonAccessible.description')}
            </H3>
          </div>
          <div className="rows gapped-xxs accessibility-statement-page__content__caveats">
            {caveats.map(({}, i) => (
              <div className="rows gapped-xs margin-top-xxl" key={i}>
                <H2>{`${translateAccessibility(
                  `content.caveats.items.${i}.title`
                )}`}</H2>
                <H3>{translateAccessibility('content.caveats.description')}</H3>
                <Text>
                  {translateAccessibility(
                    `content.caveats.items.${i}.description`
                  )}
                </Text>
                <H3>
                  {translateAccessibility('content.caveats.extraDescription')}
                </H3>
                <ul>
                  <Text>
                    <li>
                      {translateAccessibility(
                        `content.caveats.items.${i}.claim`
                      )}
                    </li>
                  </Text>
                </ul>
              </div>
            ))}
          </div>
          <div className="rows gapped-xxs">
            <H2>{translateAccessibility('content.feedback.title')}</H2>
            <Text>{translateAccessibility('content.feedback.subtitle')}</Text>
            <Text>
              {translateAccessibility('content.feedback.description', {
                email: translateCommon('contactEmail'),
              })}
            </Text>
          </div>
          <div className="rows gapped-xxs">
            <H2>
              {translateAccessibility('content.administrativeAgency.title')}
            </H2>
            <div className="inline-text-box">
              <Text>
                {translateAccessibility(
                  'content.administrativeAgency.description'
                )}
              </Text>
              <ExtLink
                className="accessibility-statement-page__content__link"
                text={translateAccessibility(
                  'content.administrativeAgency.links.title'
                )}
                href={translateAccessibility(
                  'content.administrativeAgency.links.link'
                )}
              />
              <Text>
                {translateAccessibility(
                  'content.administrativeAgency.extraDescription'
                )}
              </Text>
            </div>
          </div>
          <div className="rows gapped-xxs">
            <H2>
              {translateAccessibility(
                'content.contactAdministrativeAgency.title'
              )}
            </H2>
            {administrativeAgencyContactDetails.map((k, i) => (
              <Text key={i}>
                {translateAccessibility(
                  `content.contactAdministrativeAgency.details.${k}`
                )}
              </Text>
            ))}
            <ExtLink
              className="accessibility-statement-page__content__link"
              text={translateAccessibility(
                `content.contactAdministrativeAgency.links.website.title`
              )}
              href={translateAccessibility(
                `content.contactAdministrativeAgency.links.website.link`
              )}
              aria-label={translateAccessibility(
                `content.contactAdministrativeAgency.links.website.ariaLabel`
              )}
              endIcon={<OpenInNewIcon />}
            />
            <ExtLink
              className="accessibility-statement-page__content__link"
              text={translateAccessibility(
                `content.contactAdministrativeAgency.links.email.title`
              )}
              href={`mailto:${translateAccessibility(
                `content.contactAdministrativeAgency.links.email.link`
              )}`}
            />
          </div>
          <div className="rows gapped-xxs">
            <H2>{translateAccessibility('content.furtherImprove.title')}</H2>
            <H3>{translateAccessibility('content.furtherImprove.subtitle')}</H3>
            <Text>
              {translateAccessibility('content.furtherImprove.description')}
            </Text>
            <Text>
              {translateAccessibility(
                'content.furtherImprove.extraDescription'
              )}
            </Text>
          </div>
          <div>
            <BackButton />
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};
