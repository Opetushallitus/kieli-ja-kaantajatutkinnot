import {
  ArrowBackIosOutlined as ArrowBackIosOutlinedIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { Grid } from '@mui/material';
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

const BulletList = ({ translations }: { translations: Array<string> }) => {
  const translatePrivacy = usePrivacyTranslation();

  return (
    <ul>
      <Text>
        {translations.map((translation, i) => (
          <li key={i}>{translatePrivacy(translation)}</li>
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
      <Grid item className="privacy-policy-page__heading">
        <H1>{translatePrivacy('heading')}</H1>
        <HeaderSeparator />
      </Grid>
      <Grid item>
        <div>
          <BackButton />
        </div>
        <div className="rows gapped">
          <H2>{translatePrivacy('general.title')}</H2>
          <Text>{translatePrivacy('general.description1')}</Text>
          <ExtLink
            className="privacy-policy-page__content__link"
            text={translatePrivacy('general.externalLink.title')}
            href={translatePrivacy('general.externalLink.link')}
            endIcon={<OpenInNewIcon />}
          />
          <Text>{translatePrivacy('general.description2')}</Text>
          <Text>{translatePrivacy('general.description3')}</Text>
        </div>
        <div className="rows gapped">
          <H2>{translatePrivacy('gathering.title')}</H2>
          <H3>{translatePrivacy('common.personalData')}</H3>
          <Text>{translatePrivacy('gathering.personal.description')}</Text>
          <Text>{translatePrivacy('gathering.personal.data.title')}</Text>
          <BulletList
            translations={[
              'gathering.personal.data.description1',
              'gathering.personal.data.description2',
            ]}
          />
          <Text>{translatePrivacy('gathering.personal.usage.title')}</Text>
          <BulletList
            translations={['gathering.personal.usage.description1']}
          />
          <H3>{translatePrivacy('common.otherData')}</H3>
          <BulletList
            translations={[
              'gathering.other.description1',
              'gathering.other.description2',
            ]}
          />
        </div>
        <div className="rows gapped">
          <H2>{translatePrivacy('purpose.title')}</H2>
          <H3>{translatePrivacy('common.personalData')}</H3>
          <Text>{translatePrivacy('purpose.personal.data.title')}</Text>
          <BulletList
            translations={[
              'purpose.personal.data.description1',
              'purpose.personal.data.description2',
            ]}
          />
        </div>
        <div className="rows gapped">
          <H2>{translatePrivacy('disclosure.title')}</H2>
          <Text>{translatePrivacy('disclosure.description')}</Text>
          <Text>{translatePrivacy('disclosure.consent.title')}</Text>
          <BulletList translations={['disclosure.consent.description1']} />
          <Text>{translatePrivacy('disclosure.community.title')}</Text>
          <BulletList translations={['disclosure.community.description1']} />
          <Text>{translatePrivacy('disclosure.serviceProvider.title')}</Text>
          <BulletList
            translations={[
              'disclosure.serviceProvider.description1',
              'disclosure.serviceProvider.description2',
            ]}
          />
          <Text>{translatePrivacy('disclosure.dataTransfers.title')}</Text>
          <BulletList
            translations={['disclosure.dataTransfers.description1']}
          />
          <Text>{translatePrivacy('disclosure.research.title')}</Text>
          <BulletList translations={['disclosure.research.description1']} />
          <Text>{translatePrivacy('disclosure.legislation.title')}</Text>
          <BulletList translations={['disclosure.legislation.description1']} />
          <Text>{translatePrivacy('disclosure.thirdCountries.title')}</Text>
          <BulletList
            translations={['disclosure.thirdCountries.description1']}
          />
        </div>
        <div className="rows gapped">
          <H2>{translatePrivacy('processing.title')}</H2>
          <Text>{translatePrivacy('processing.description1')}</Text>
        </div>
        <div className="rows gapped">
          <H2>{translatePrivacy('protection.title')}</H2>
          <Text>{translatePrivacy('protection.description1')}</Text>
          <Text>{translatePrivacy('protection.description2')}</Text>
        </div>
        <div className="rows gapped">
          <H2>{translatePrivacy('preservation.title')}</H2>
          <Text>{translatePrivacy('preservation.description1')}</Text>
        </div>
        <div className="rows gapped">
          <H2>{translatePrivacy('rights.title')}</H2>
          <Text>{translatePrivacy('rights.description1')}</Text>
          <Text>{translatePrivacy('rights.description2')}</Text>
        </div>
        <div className="rows gapped">
          <H2>{translatePrivacy('changes.title')}</H2>
          <Text>{translatePrivacy('changes.description1')}</Text>
        </div>
        <div className="rows gapped">
          <H2>{translatePrivacy('registrar.title')}</H2>
          <Text>{translatePrivacy('registrar.description1')}</Text>
          <Text>{translatePrivacy('registrar.description2')}</Text>
          <Text>
            {translatePrivacy('registrar.contact.name')}
            <br />
            {translatePrivacy('registrar.contact.address1')}
            <br />
            {translatePrivacy('registrar.contact.address2')}
          </Text>
          <Text>
            {translatePrivacy('registrar.contact.email')}{' '}
            <ExtLink
              className="privacy-policy-page__content__link"
              href={`mailto:${translatePrivacy(
                'registrar.contact.emailAddress1'
              )}`}
              text={translatePrivacy('registrar.contact.emailAddress1')}
            ></ExtLink>
            {` ${translatePrivacy('common.or')} `}
            <ExtLink
              className="privacy-policy-page__content__link"
              href={`mailto:${translatePrivacy(
                'registrar.contact.emailAddress2'
              )}`}
              text={translatePrivacy('registrar.contact.emailAddress2')}
            ></ExtLink>
            <br />
            {translatePrivacy('registrar.contact.phone')}{' '}
            <ExtLink
              className="privacy-policy-page__content__link"
              href={`tel:${translatePrivacy('registrar.contact.phoneNumber')}`}
              text={translatePrivacy('registrar.contact.phoneNumber')}
            ></ExtLink>
          </Text>
          <Text>
            <i>{translatePrivacy('registrar.published')}</i>
            <br />
            <i>{translatePrivacy('registrar.modified')}</i>
          </Text>
        </div>
        <div>
          <BackButton />
        </div>
      </Grid>
    </Grid>
  );
};
