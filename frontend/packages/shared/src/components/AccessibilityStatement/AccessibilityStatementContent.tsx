import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { FC, PropsWithChildren } from 'react';

import { ExtLink } from '../ExtLink/ExtLink';
import { H2, H3, Text } from '../Text/Text';
import './AccessibilityStatement.scss';

type AccessibilityStatementContentProps = {
  caveats: string[];
  feedbackEmail: string;
  translateAccessibility: (s: string) => string;
};

export const AccessibilityStatementContent: FC<
  PropsWithChildren<AccessibilityStatementContentProps>
> = ({
  caveats,
  feedbackEmail,
  translateAccessibility,
}: AccessibilityStatementContentProps) => {
  const sharedLinkCss = {
    fontSize: '1.6rem',
    textTransform: 'none',
  };

  const agencyDescriptionLinkCss = {
    ...sharedLinkCss,
    paddingRight: 0,
  };

  const contactLinkCss = {
    ...sharedLinkCss,
    alignSelf: 'flex-start',
    padding: 0,
  };

  return (
    <div className="accessibility-statement">
      <div className="accessibility-statement-content rows gapped-xxl">
        <div className="rows gapped-xxs">
          <H2>{translateAccessibility('content.status.title')}</H2>
          <Text>{translateAccessibility('content.status.description')}</Text>
        </div>
        <div className="rows gapped-xxs">
          <H2>{translateAccessibility('content.nonAccessible.title')}</H2>
          <H3>{translateAccessibility('content.nonAccessible.description')}</H3>
        </div>
        <div className="accessibility-statement-content__caveats rows gapped-xxl">
          {caveats.map(({}, i) => (
            <div className="rows gapped-xs" key={i}>
              <H2>{`${translateAccessibility(
                `content.caveats.items.${i}.title`
              )}`}</H2>
              <H3>{translateAccessibility('content.caveats.description')}</H3>
              <Text>
                {translateAccessibility(
                  `content.caveats.items.${i}.description`
                )}
              </Text>
              <div>
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
            </div>
          ))}
        </div>
        <div className="rows gapped-xxs">
          <H2>{translateAccessibility('content.feedback.title')}</H2>
          <Text>{translateAccessibility('content.feedback.subtitle')}</Text>
          <Text>
            {`${translateAccessibility(
              'content.feedback.description'
            )}: ${feedbackEmail}`}
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
              sx={agencyDescriptionLinkCss}
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
          <Text>
            {translateAccessibility('content.contactAdministrativeAgency.name')}
          </Text>
          <Text>
            {translateAccessibility('content.contactAdministrativeAgency.unit')}
          </Text>
          <ExtLink
            sx={contactLinkCss}
            className="accessibility-statement__content__link"
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
            sx={contactLinkCss}
            className="accessibility-statement__content__link"
            text={translateAccessibility(
              `content.contactAdministrativeAgency.links.email.title`
            )}
            href={`mailto:${translateAccessibility(
              `content.contactAdministrativeAgency.links.email.link`
            )}`}
          />
          <Text>
            {translateAccessibility(
              'content.contactAdministrativeAgency.phone'
            )}
          </Text>
        </div>
        <div className="rows gapped-xxs">
          <H2>{translateAccessibility('content.furtherImprove.title')}</H2>
          <H3>{translateAccessibility('content.furtherImprove.subtitle')}</H3>
          <Text>
            {translateAccessibility('content.furtherImprove.description')}
          </Text>
          <Text>
            {translateAccessibility('content.furtherImprove.extraDescription')}
          </Text>
        </div>
      </div>
    </div>
  );
};
