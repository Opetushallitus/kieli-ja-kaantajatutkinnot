import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { APIResponseStatus } from 'shared/enums';

import { getCurrentLang, useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ClerkExamSession } from 'interfaces/clerkExamSession';
import { Label } from 'ophTheme/Text';
import { loadNationalities } from 'redux/reducers/nationalities';
import { nationalitiesSelector } from 'redux/selectors/nationalities';
import { DateTimeUtils } from 'utils/dateTime';
import { ExamSessionUtils } from 'utils/examSession';

export const ClerkExamSessionDetails = ({
  examSessionDetails,
}: {
  examSessionDetails: ClerkExamSession | null;
}) => {
  const dispatch = useDispatch();
  const appLanguage = getCurrentLang();
  const t = useCommonTranslation();

  if (!examSessionDetails) {
    return <></>;
  }

  const location = ExamSessionUtils.getLocationInfo(
    examSessionDetails,
    getCurrentLang(),
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
            {t('languageLevel.' + examSessionDetails.level)}
            {' '}
            {DateTimeUtils.renderDate(examSessionDetails.date)}
          </div>
          <div>
            {DateTimeUtils.renderDate(examSessionDetails.registrationStartDate)}
            {' - '}
            {DateTimeUtils.renderDate(examSessionDetails.registrationEndDate)}
          </div>
          <div>{location.streetAddress}, {location.zip} {location.postOffice}</div>
          <div>{examSessionDetails.maxParticipants}</div>
          <div>{examSessionDetails.contact.map((c) => <span>{c.email}</span>)}</div>
          <div>
            {examSessionDetails.location.map((l) =>
              <div>
                <span>{l.lang}</span>
                <span>{l.extraInformation}</span>
              </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};
