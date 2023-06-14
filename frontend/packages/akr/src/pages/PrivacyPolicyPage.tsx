import { ArrowBackIosOutlined as ArrowBackIosOutlinedIcon } from '@mui/icons-material';
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

export const PrivacyPolicyPage = () => {
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
            <Text>
              {translatePrivacy('registerName.contents.description')}
              {':'}
              <BulletList
                localisationKeys={[
                  'registerName.contents.item1',
                  'registerName.contents.item2',
                ]}
              />
            </Text>
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
              <ExtLink
                className="privacy-policy-page__content__link"
                href="mailto:opetushallitus@oph.fi"
                text="opetushallitus@oph.fi"
              />
              {', '}
              <ExtLink
                className="privacy-policy-page__content__link"
                href="mailto:kirjaamo@oph.fi"
                text="kirjaamo@oph.fi"
              />
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
              <ExtLink
                className="privacy-policy-page__content__link"
                href="mailto:kirjaamo@oph.fi"
                text="kirjaamo@oph.fi"
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
              <ExtLink
                className="privacy-policy-page__content__link"
                href="mailto:tietosuoja@oph.fi"
                text="tietosuoja@oph.fi"
              />
              <br />
              {translatePrivacy('common.phoneSwitch')}
            </Text>
          </div>
          <div className="rows gapped">
            <H2>{translatePrivacy('handlingPurpose.heading')}</H2>
            <Text>{translatePrivacy('handlingPurpose.description1')}</Text>
            <Text>{translatePrivacy('handlingPurpose.description2')}</Text>
            <Text>{translatePrivacy('handlingPurpose.description3')}</Text>
            <Text>{translatePrivacy('handlingPurpose.description4')}</Text>
            <Text>
              <H3>{translatePrivacy('handlingPurpose.law.heading')}</H3>
              {translatePrivacy('handlingPurpose.law.description')}
              {': '}
              <ExtLink
                className="privacy-policy-page__content__link"
                href={translatePrivacy('handlingPurpose.law.link')}
                text={translatePrivacy('handlingPurpose.law.link')}
              ></ExtLink>
              <br />
              {translatePrivacy('handlingPurpose.law.clause')}
            </Text>
          </div>
          <div className="rows gapped">
            <H2>{translatePrivacy('dataContents.heading')}</H2>
            <Text>
              <H3>
                {translatePrivacy('common.group')} 1:{' '}
                {translatePrivacy('dataContents.group1.name')}
              </H3>
              {translatePrivacy('dataContents.group1.action')}
            </Text>
            <Text>
              {translatePrivacy('dataContents.group1.description1')}
              <br />
              {translatePrivacy('dataContents.group1.description2')}
              <br />
              {translatePrivacy('dataContents.group1.description3')}
            </Text>
            <Text>{translatePrivacy('dataContents.group1.description4')}</Text>
            <Text>
              <H3>
                {translatePrivacy('common.group')} 2:{' '}
                {translatePrivacy('dataContents.group2.name')}
              </H3>
              {translatePrivacy('dataContents.group2.action')}
            </Text>
            <Text>{translatePrivacy('dataContents.group2.description')}</Text>
            <Text>
              <H3>
                {translatePrivacy('common.group')} 3:{' '}
                {translatePrivacy('dataContents.group3.name')}
              </H3>
              {translatePrivacy('dataContents.group3.action')}
            </Text>
            <Text>
              {translatePrivacy('dataContents.group3.grounds.description1')}:
              <BulletList
                localisationKeys={[
                  'dataContents.group3.grounds.ground1',
                  'dataContents.group3.grounds.ground2',
                  'dataContents.group3.grounds.ground3',
                ]}
              />
              {translatePrivacy('dataContents.group3.grounds.description2')}
            </Text>
            <div className="rows gapped-xxs">
              <Text>
                {translatePrivacy('dataContents.group3.details.heading')}
                {':'}
              </Text>
              <Text>
                {translatePrivacy('dataContents.group3.details.description')}
              </Text>
            </div>
            <Text>
              {translatePrivacy(
                'dataContents.group3.details.otherDetails.description'
              )}
              :
              <BulletList
                localisationKeys={[
                  'dataContents.group3.details.otherDetails.detail1',
                  'dataContents.group3.details.otherDetails.detail2',
                ]}
              />
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
            <Text>
              {translatePrivacy('common.group')} 1
              <br />
              {translatePrivacy('holdingPeriod.group1.description')}
            </Text>
            <Text>
              {translatePrivacy('common.group')} 3
              <br />
              {translatePrivacy('holdingPeriod.group3.description')}
            </Text>
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
