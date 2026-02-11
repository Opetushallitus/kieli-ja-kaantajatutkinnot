import { OphButton } from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import { AppLanguage, Variant } from 'shared/enums';

import { ClerkExamSessionEditModal } from 'components/clerkExamSession/ClerkExamSessionEditModal';
import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { ClerkExamSession } from 'interfaces/clerkExamSession';
import { H3, Label, Text } from 'ophTheme/Text';
import { DateTimeUtils } from 'utils/dateTime';

export const ClerkExamSessionDetails = ({
  examSessionDetails,
}: {
  examSessionDetails: ClerkExamSession | null;
}) => {
  const t = useCommonTranslation();
  const { t: tButtons } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamSessionRegistrations.buttons',
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
      <div className="columns" style={{ justifyContent: 'space-between' }}>
        <H3>{location && location.name}</H3>
        <OphButton
          color="primary"
          variant={Variant.Outlined}
          onClick={() => setIsEditModalOpen(true)}
        >
          {tButtons('edit')}
        </OphButton>
      </div>
      <div>
        <Text>
          {t('languages.' + examSessionDetails.language)}
          {' - '}
          {t('languageLevel.' + examSessionDetails.level)}{' '}
          {DateTimeUtils.renderDate(examSessionDetails.date)}
        </Text>
      </div>
      <div className="grid-4-columns gapped">
        <div className="rows gapped-xs">
          <div className="rows gapped-xs">
            <Label>{t('registrationPeriod')}</Label>
            <div>
              {DateTimeUtils.renderDate(
                examSessionDetails.registrationStartDate,
              )}
              {' - '}
              {DateTimeUtils.renderDate(examSessionDetails.registrationEndDate)}
            </div>
          </div>
          <div className="rows gapped-xs">
            <Label>{t('institution')}</Label>
            <div>
              {location && (
                <>
                  {location.streetAddress}, {location.zip} {location.postOffice}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="rows gapped-xs">
          <Label>{t('maxParticipants')}</Label>
          <div>{examSessionDetails.maxParticipants}</div>
        </div>
        <div className="rows gapped-xs">
          <Label>{t('contactInfo')}</Label>
          <div className="rows">
            {examSessionDetails.contact &&
              examSessionDetails.contact.map((c) => (
                <div className="rows" key={'contact-email-' + c.email}>
                  <span>{c.name}</span>
                  <span>{c.phoneNumber}</span>
                  <span>{c.email}</span>
                </div>
              ))}
          </div>
        </div>
        <div className="rows gapped-xs">
          <Label>{t('extraInfo')}</Label>
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
      <ClerkExamSessionEditModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        examSessionDetails={examSessionDetails}
      />
    </div>
  );
};
