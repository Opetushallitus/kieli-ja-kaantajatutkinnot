import { Grid } from '@mui/material';
import { FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ExtLink, H1, H2, H3, HeaderSeparator, Text } from 'shared/components';
import { CommonUtils } from 'shared/utils';

import { usePrivacyTranslation } from 'configs/i18n';

type BulletListProps = {
  translations: Array<string>;
};

const BulletList: FC<BulletListProps> = ({ translations }) => {
  const translatePrivacy = usePrivacyTranslation();

  return (
    <ul>
      {translations.map((translation, i) => (
        <li key={i}>
          <Text>{translatePrivacy(translation)}</Text>
        </li>
      ))}
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
        <div className="rows gapped">
          <H2>{translatePrivacy('general.title')}</H2>
          <Text>{translatePrivacy('general.description1')}</Text>
          <ExtLink
            className="privacy-policy-page__content__link"
            text={translatePrivacy('general.externalLink.title')}
            href={translatePrivacy('general.externalLink.link')}
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
              'gathering.other.description3',
            ]}
          />
        </div>
        <div className="rows gapped">
          <H2>{translatePrivacy('reasoning.title')}</H2>
          <H3>{translatePrivacy('common.personalData')}</H3>
          <Text>{translatePrivacy('reasoning.personal.data.title')}</Text>
          <BulletList
            translations={[
              'reasoning.personal.data.description1',
              'reasoning.personal.data.description2',
            ]}
          />
          <H3>{translatePrivacy('common.otherData')}</H3>
          <BulletList
            translations={[
              'reasoning.other.description1',
              'reasoning.other.description2',
            ]}
          />
        </div>
        <div className="rows gapped">
          <H2>{translatePrivacy('abandonment.title')}</H2>
          <Text>{translatePrivacy('abandonment.description')}</Text>
          <Text>{translatePrivacy('abandonment.consent.title')}</Text>
          <BulletList translations={['abandonment.consent.description1']} />
          <Text>{translatePrivacy('abandonment.community.title')}</Text>
          <BulletList translations={['abandonment.community.description1']} />
          <Text>{translatePrivacy('abandonment.serviceProvider.title')}</Text>
          <BulletList
            translations={[
              'abandonment.serviceProvider.description1',
              'abandonment.serviceProvider.description2',
            ]}
          />
          <Text>{translatePrivacy('abandonment.dataTransfers.title')}</Text>
          <BulletList
            translations={['abandonment.dataTransfers.description1']}
          />
          <Text>{translatePrivacy('abandonment.research.title')}</Text>
          <BulletList translations={['abandonment.research.description1']} />
          <Text>{translatePrivacy('abandonment.legislation.title')}</Text>
          <BulletList translations={['abandonment.legislation.description1']} />
          <Text>{translatePrivacy('abandonment.thirdCountries.title')}</Text>
          <BulletList
            translations={['abandonment.thirdCountries.description1']}
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
          <H2>{translatePrivacy('cookies.title')}</H2>
          <Text>{translatePrivacy('cookies.description1')}</Text>
          <ExtLink
            className="privacy-policy-page__content__link"
            text={translatePrivacy('cookies.externalLink.title')}
            href={translatePrivacy('cookies.externalLink.link')}
          />
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
          <H2>{translatePrivacy('registerHolder.title')}</H2>
          <Text>{translatePrivacy('registerHolder.description1')}</Text>
          <Text>{translatePrivacy('registerHolder.description2')}</Text>
          <Text>
            {translatePrivacy('registerHolder.holder.name')}
            <br />
            {translatePrivacy('registerHolder.holder.address1')}
            <br />
            {translatePrivacy('registerHolder.holder.address2')}
          </Text>
          <Text>
            {translatePrivacy('registerHolder.holder.email')}{' '}
            <ExtLink
              className="privacy-policy-page__content__link"
              href={`mailto:${translatePrivacy(
                'registerHolder.holder.emailAddress1'
              )}`}
              text={translatePrivacy('registerHolder.holder.emailAddress1')}
            ></ExtLink>{' '}
            <ExtLink
              className="privacy-policy-page__content__link"
              href={`mailto:${translatePrivacy(
                'registerHolder.holder.emailAddress2'
              )}`}
              text={translatePrivacy('registerHolder.holder.emailAddress2')}
            ></ExtLink>
            <br />
            {translatePrivacy('registerHolder.holder.phone')}{' '}
            <ExtLink
              className="privacy-policy-page__content__link"
              href={`tel:${translatePrivacy(
                'registerHolder.holder.phoneNumber'
              )}`}
              text={translatePrivacy('registerHolder.holder.phoneNumber')}
            ></ExtLink>
          </Text>
          <Text>
            <i>{translatePrivacy('registerHolder.published')}</i>
            <br />
            <i>{translatePrivacy('registerHolder.modified')}</i>
          </Text>
        </div>
      </Grid>
    </Grid>
  );
};
