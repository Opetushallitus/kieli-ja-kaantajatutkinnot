import {
  ArrowBackIosOutlined as ArrowBackIosOutlinedIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { Grid, Paper } from '@mui/material';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
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

import { useCommonTranslation, usePrivacyTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

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

const BulletList = ({
  localisationKeys,
}: {
  localisationKeys: Array<string>;
}) => {
  const translatePrivacy = usePrivacyTranslation();

  return (
    <ul>
      <Text>
        {localisationKeys.map((key, i) => (
          <li key={i}>{translatePrivacy(key)}</li>
        ))}
      </Text>
    </ul>
  );
};

const PrivacyPolicyPage = () => {
  const translatePrivacy = usePrivacyTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    CommonUtils.scrollToTop();
  }, [pathname]);

  return (
    <Grid
      className="privacy-policy-page"
      container
      rowSpacing={4}
      direction="column"
    >
      <Grid item className="privacy-policy-page__back-button">
        <BackButton />
      </Grid>
      <Grid item className="privacy-policy-page__heading">
        <H1>{translatePrivacy('heading')}</H1>
        <HeaderSeparator />
        <Text>{translatePrivacy('description')}</Text>
      </Grid>
      <Grid item>
        <Paper
          className="privacy-policy-page__content rows gapped-xxl"
          elevation={3}
        >
          <div className="rows gapped">
            <H2>{translatePrivacy('registerName.heading')}</H2>
            <Text>{translatePrivacy('registerName.description')}</Text>
          </div>
          <div className="rows gapped">
            <H2>{translatePrivacy('registrar.heading')}</H2>
            <div className="rows gapped-xxs">
              <Text>{translatePrivacy('registrar.contact.name')}</Text>
              <Text>{translatePrivacy('registrar.contact.address')}</Text>
            </div>
            <Text>
              {translatePrivacy('registrar.contact.otherDetails')}
              <br />
              {translatePrivacy('common.email')}:{' '}
              <WebLink
                href="mailto:opetushallitus@oph.fi"
                label="opetushallitus@oph.fi"
              />
              {', '}
              <WebLink href="mailto:kirjaamo@oph.fi" label="kirjaamo@oph.fi" />
              <br />
              {translatePrivacy('registrar.contact.phoneSwitch')}
            </Text>
          </div>
          <div className="rows gapped">
            <H2>{translatePrivacy('registrarContactPerson.heading')}</H2>
            <Text>
              {translatePrivacy('registrarContactPerson.person.name')}
              <br />
              {translatePrivacy('common.email')}:{' '}
              <WebLink
                href="mailto:niina.juuti@oph.fi"
                label="niina.juuti@oph.fi"
              />
              <br />
              {translatePrivacy('common.phoneSwitch')}
            </Text>
            <Text>
              {translatePrivacy('registrarContactPerson.liable.description')}
              {':'}
              <br />
              {translatePrivacy('registrarContactPerson.liable.name')}
              <br />
              {translatePrivacy('common.email')}:{' '}
              <WebLink
                href="mailto:tietosuoja@oph.fi"
                label="tietosuoja@oph.fi"
              />
              <br />
              {translatePrivacy('common.phoneSwitch')}
            </Text>
          </div>
          <div className="rows gapped">
            <H2>{translatePrivacy('handlingPurpose.heading')}</H2>
            <Text>{translatePrivacy('handlingPurpose.description')}</Text>
            <div className="rows gapped-xxs">
              <H3>{translatePrivacy('handlingPurpose.law.heading')}</H3>
              <Text>
                <Trans
                  t={translatePrivacy}
                  i18nKey="handlingPurpose.law.part1.description"
                >
                  <WebLink
                    href={translatePrivacy('handlingPurpose.law.part1.link')}
                    label={translatePrivacy(
                      'handlingPurpose.law.part1.content'
                    )}
                    endIcon={<OpenInNewIcon />}
                  />
                </Trans>
              </Text>
              <Text>
                {translatePrivacy('handlingPurpose.law.part2.description')}
              </Text>
            </div>
          </div>
          <div className="rows gapped">
            <H2>{translatePrivacy('dataContents.heading')}</H2>
            <div className="rows gapped-xxs">
              <Text>
                {translatePrivacy('dataContents.group1.givenDetails.heading')}:
              </Text>
              <Text>
                {translatePrivacy(
                  'dataContents.group1.givenDetails.description'
                )}
              </Text>
            </div>
            <Text>
              {translatePrivacy('dataContents.group1.otherDetails.heading')}:
              <BulletList
                localisationKeys={[
                  'dataContents.group1.otherDetails.ul1',
                  'dataContents.group1.otherDetails.ul2',
                  'dataContents.group1.otherDetails.ul3',
                  'dataContents.group1.otherDetails.ul4',
                  'dataContents.group1.otherDetails.ul5',
                ]}
              />
            </Text>
            <Text>
              {translatePrivacy(
                'dataContents.group1.dataProcessing.description1'
              )}
            </Text>
            <Text>
              {translatePrivacy(
                'dataContents.group1.dataProcessing.description2'
              )}
            </Text>
            <Text>
              {translatePrivacy(
                'dataContents.group1.dataProcessing.description3'
              )}
            </Text>
          </div>
          <div className="rows gapped">
            <H2>{translatePrivacy('receivers.heading')}</H2>
            <Text>{translatePrivacy('receivers.description1')}</Text>
            <Text>{translatePrivacy('receivers.description2')}</Text>
            <Text>{translatePrivacy('receivers.description3')}</Text>
            <Text>{translatePrivacy('receivers.description4')}</Text>
          </div>
          <div className="rows gapped">
            <H2>{translatePrivacy('dataTransfers.heading')}</H2>
            <Text>{translatePrivacy('dataTransfers.description')}</Text>
          </div>
          <div className="rows gapped">
            <H2>{translatePrivacy('holdingPeriod.heading')}</H2>
            <Text>{translatePrivacy('holdingPeriod.description1')}</Text>
            <Text>{translatePrivacy('holdingPeriod.description2')}</Text>
          </div>
          <div className="rows gapped">
            <H2>
              {translatePrivacy('registeredRights.heading')}
              <BulletList
                localisationKeys={[
                  'registeredRights.rights.right1',
                  'registeredRights.rights.right2',
                  'registeredRights.rights.right3',
                  'registeredRights.rights.right4',
                  'registeredRights.rights.right5',
                  'registeredRights.rights.right6',
                ]}
              />
            </H2>
            <Text>{translatePrivacy('registeredRights.description1')}</Text>
            <Text>{translatePrivacy('registeredRights.description2')}</Text>
            <Text>{translatePrivacy('registeredRights.description3')}</Text>
            <Text>{translatePrivacy('registeredRights.description4')}</Text>
            <Text>{translatePrivacy('registeredRights.description5')}</Text>
            <Text>{translatePrivacy('registeredRights.description6')}</Text>
            <Text>{translatePrivacy('registeredRights.description7')}</Text>
            <Text>{translatePrivacy('registeredRights.description8')}</Text>
          </div>
          <div className="rows gapped">
            <H2>{translatePrivacy('complaints.heading')}</H2>
            <Text>{translatePrivacy('complaints.description')}</Text>
          </div>
          <div className="rows gapped">
            <H2>{translatePrivacy('dataSources.heading')}</H2>
            <Text>{translatePrivacy('dataSources.description')}</Text>
          </div>
          <div className="rows gapped">
            <H2>{translatePrivacy('automatedDecisions.heading')}</H2>
            <Text>{translatePrivacy('automatedDecisions.description')}</Text>
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default PrivacyPolicyPage;
