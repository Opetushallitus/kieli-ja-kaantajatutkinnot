import { OphButton } from '@opetushallitus/oph-design-system';
import { useEffect, useRef, useState } from 'react';
import {
  APIResponseStatus,
  AppLanguage,
  Severity,
  Variant,
} from 'shared/enums';
import { useToast } from 'shared/hooks';

import { ClerkExamSessionEditModal } from 'components/clerkExamSession/ClerkExamSessionEditModal';
import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ClerkExamSession } from 'interfaces/clerkExamSession';
import { ExamDate } from 'interfaces/examDate';
import { H3, Label, Text } from 'ophTheme/Text';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';
import { DateTimeUtils } from 'utils/dateTime';

export const ClerkExamSessionDetails = ({
  examSessionDetails,
  languages,
  examDates,
}: {
  examSessionDetails: ClerkExamSession | null;
  languages: string[];
  examDates: ExamDate[];
}) => {
  const commonTranslation = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamSessionRegistrations',
  });
  const { showToast } = useToast();
  const { updateStatus } = useAppSelector(clerkExamSessionDetailsSelector);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const prevUpdateStatus = useRef(updateStatus);

  useEffect(() => {
    if (prevUpdateStatus.current === APIResponseStatus.InProgress) {
      if (updateStatus === APIResponseStatus.Success) {
        showToast({
          severity: Severity.Success,
          description: t('modals.edit.toasts.saveSuccess'),
        });
      } else if (updateStatus === APIResponseStatus.Error) {
        showToast({
          severity: Severity.Error,
          description: t('modals.edit.toasts.saveFailed'),
        });
      }
    }
    prevUpdateStatus.current = updateStatus;
  }, [updateStatus, showToast, t]);

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
          {t('buttons.edit')}
        </OphButton>
      </div>
      <div>
        <Text>
          {commonTranslation('languages.' + examSessionDetails.language)}
          {' - '}
          {commonTranslation('languageLevel.' + examSessionDetails.level)}{' '}
          {DateTimeUtils.renderDate(examSessionDetails.date)}
        </Text>
      </div>
      <div className="grid-4-columns gapped">
        <div className="rows gapped-xs">
          <div className="rows gapped-xs">
            <Label>{commonTranslation('registrationPeriod')}</Label>
            <div>
              {DateTimeUtils.renderDate(
                examSessionDetails.registrationStartDate,
              )}
              {' - '}
              {DateTimeUtils.renderDate(examSessionDetails.registrationEndDate)}
            </div>
          </div>
          <div className="rows gapped-xs">
            <Label>{commonTranslation('institution')}</Label>
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
          <Label>{commonTranslation('maxParticipantsTotal')}</Label>
          <div>{examSessionDetails.maxParticipantsTotal}</div>
        </div>
        <div className="rows gapped-xs">
          <Label>{commonTranslation('contactInfo')}</Label>
          <div className="rows">
            <span>{examSessionDetails.contactName}</span>
            <span>{examSessionDetails.contactPhoneNumber}</span>
            <span>{examSessionDetails.contactEmail}</span>
          </div>
        </div>
        <div className="rows gapped-xs">
          <Label>{commonTranslation('extraInfo')}</Label>
          <div>
            {examSessionDetails.location.map((l) => (
              <div key={'location-lang-' + l.lang}>
                <Text className="bold">
                  {commonTranslation('lang.' + l.lang)}
                </Text>
                <span>{l.extraInformation ?? '-'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ClerkExamSessionEditModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        examSessionDetails={examSessionDetails}
        languages={languages}
        examDates={examDates}
      />
    </div>
  );
};
