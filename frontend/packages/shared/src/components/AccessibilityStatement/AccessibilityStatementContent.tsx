import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { FC, PropsWithChildren } from 'react';

import { H2, H3, Text } from '../Text/Text';

import './AccessibilityStatement.scss';
import { WebLink } from 'components/WebLink/WebLink';

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
  return (
    <div className="accessibility-statement">
      <div className="accessibility-statement-content rows gapped-xxl">
        <div className="rows gapped-xxs">
          <H2>{translateAccessibility('content.status.title')}</H2>
          <Text>{translateAccessibility('content.status.description')}</Text>
        </div>
        <div className="rows gapped-xxs">
          <H2>{translateAccessibility('content.nonAccessible.title')}</H2>
          <Text>
            {translateAccessibility('content.nonAccessible.description')}
          </Text>
        </div>
        <div className="accessibility-statement-content__caveats rows gapped-xxl">
          {caveats.map(({}, i) => (
            <div className="rows gapped-xs" key={i}>
              <H3>{`${translateAccessibility(
                `content.caveats.items.${i}.title`
              )}`}</H3>
              <Text>
                {translateAccessibility('content.caveats.description')}
              </Text>
              <Text>
                {translateAccessibility(
                  `content.caveats.items.${i}.description`
                )}
              </Text>
              <div>
                <Text>
                  {translateAccessibility('content.caveats.extraDescription')}
                </Text>
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
            {`${translateAccessibility('content.feedback.description')}: `}
            <WebLink href={`mailto:${feedbackEmail}`} label={feedbackEmail} />
          </Text>
        </div>
        <div className="rows gapped-xxs">
          <H3>
            {translateAccessibility('content.administrativeAgency.title')}
          </H3>
          <div className="inline-text-box">
            <Text>
              {translateAccessibility(
                'content.administrativeAgency.description'
              )}
            </Text>
            <Text>
              <WebLink
                href={translateAccessibility(
                  'content.administrativeAgency.links.link'
                )}
                label={translateAccessibility(
                  'content.administrativeAgency.links.title'
                )}
                endIcon={<OpenInNewIcon />}
              />
              {'.'}
            </Text>
            <Text>
              {translateAccessibility(
                'content.administrativeAgency.extraDescription'
              )}
            </Text>
          </div>
        </div>
        <div className="rows gapped-xxs">
          <H3>
            {translateAccessibility(
              'content.contactAdministrativeAgency.title'
            )}
          </H3>
          <Text>
            {translateAccessibility('content.contactAdministrativeAgency.name')}
          </Text>
          <Text>
            {translateAccessibility('content.contactAdministrativeAgency.unit')}
          </Text>
          <Text>
            <WebLink
              href={translateAccessibility(
                'content.contactAdministrativeAgency.links.website.link'
              )}
              label={translateAccessibility(
                'content.contactAdministrativeAgency.links.website.title'
              )}
              aria-label={translateAccessibility(
                'content.contactAdministrativeAgency.links.website.ariaLabel'
              )}
              endIcon={<OpenInNewIcon />}
            />
          </Text>
          <Text>
            <WebLink
              href={`mailto:${translateAccessibility(
                'content.contactAdministrativeAgency.links.email.link'
              )}`}
              label={translateAccessibility(
                'content.contactAdministrativeAgency.links.email.title'
              )}
            />
          </Text>
          <Text>
            {translateAccessibility(
              'content.contactAdministrativeAgency.phone'
            )}
          </Text>
        </div>
        <div className="rows gapped-xxs">
          <H3>{translateAccessibility('content.furtherImprove.title')}</H3>
          <Text>
            {translateAccessibility('content.furtherImprove.subtitle')}
          </Text>
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
