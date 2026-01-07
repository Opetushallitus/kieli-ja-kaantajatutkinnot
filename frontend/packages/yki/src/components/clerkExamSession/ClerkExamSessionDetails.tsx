import { AppLanguage } from 'shared/enums';

import { getCurrentLang, useCommonTranslation } from 'configs/i18n';
import { ClerkExamSession } from 'interfaces/clerkExamSession';
import { Label } from 'ophTheme/Text';
import { DateTimeUtils } from 'utils/dateTime';

export const ClerkExamSessionDetails = ({
  examSessionDetails,
}: {
  examSessionDetails: ClerkExamSession | null;
}) => {
  const t = useCommonTranslation();

  if (!examSessionDetails) {
    return <></>;
  }

  const lang = getCurrentLang();
  const location = examSessionDetails.location.find(
    (esl) =>
      (lang === AppLanguage.Finnish && esl.lang === 'fi') ||
      (lang === AppLanguage.Swedish && esl.lang === 'sv') ||
      (lang === AppLanguage.English && esl.lang === 'en'),
  );

  return (
    <div className="rows gapped customer-details">
      <div className="columns gapped-xxl align-items-start">
        <div className="rows gapped-xs">
          <Label>{location.name}</Label>
          <Label>{t('registrationPeriod')}</Label>
          <Label>{t('institution')}</Label>
          <Label>{t('maxParticipants')}</Label>
          <Label>{t('contactInfo')}</Label>
          <Label>{t('extraInfo')}</Label>
        </div>
        <div className="rows gapped-xs">
          <div>
            {t('languages.' + examSessionDetails.language)}
            {' - '}
            {t('languageLevel.' + examSessionDetails.level)}{' '}
            {DateTimeUtils.renderDate(examSessionDetails.date)}
          </div>
          <div>
            {DateTimeUtils.renderDate(examSessionDetails.registrationStartDate)}
            {' - '}
            {DateTimeUtils.renderDate(examSessionDetails.registrationEndDate)}
          </div>
          <div>
            {location.streetAddress}, {location.zip} {location.postOffice}
          </div>
          <div>{examSessionDetails.maxParticipants}</div>
          <div>
            {examSessionDetails.contact.map((c) => (
              <span key={'contact-email-' + c.email}>{c.email}</span>
            ))}
          </div>
          <div>
            {examSessionDetails.location.map((l) => (
              <div key={'location-lang-' + l.lang}>
                <span>{l.lang}</span>
                <span>{l.extraInformation}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
