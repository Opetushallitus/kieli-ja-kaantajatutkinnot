import { OphButton } from '@opetushallitus/oph-design-system';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { ExamSessionType } from 'enums/app';
import { ClerkExamSession } from 'interfaces/clerkExamSession';
import { ExamDate } from 'interfaces/examDate';
import { RouteType } from 'interfaces/user';
import { H3, Label, Text } from 'ophTheme/Text';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';
import { getExamSessionStartTimesDescription } from 'utils/clerk';
import { DateTimeUtils } from 'utils/dateTime';

export const ClerkExamSessionDetails = ({
  examSessionDetails,
  examDates,
  route,
}: {
  examSessionDetails: ClerkExamSession | null;
  examDates: ExamDate[];
  route: RouteType;
}) => {
  const commonTranslation = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamSessionRegistrations',
  });
  const { showToast } = useToast();
  const { updateStatus } = useAppSelector(clerkExamSessionDetailsSelector);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const prevUpdateStatus = useRef(updateStatus);
  const params = useParams();
  const oid = params.oid;

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

  const getExamSessionMaxParticipantsPartial = () => {
    return examSessionDetails.type === ExamSessionType.READ_SPEAK ? (
      <div className="rows">
        <Text>
          {t('maxParticipants.maxParticipantsReading', {
            count: examSessionDetails.maxParticipantsReadListen,
          })}
        </Text>
        <Text>
          {t('maxParticipants.maxParticipantsSpeaking', {
            count: examSessionDetails.maxParticipantsSpeakWrite,
          })}
        </Text>
      </div>
    ) : (
      <div className="rows">
        <Text>
          {t('maxParticipants.maxParticipantsSpeech', {
            count: examSessionDetails.maxParticipantsReadListen,
          })}
        </Text>
        <Text>
          {t('maxParticipants.maxParticipantsWriting', {
            count: examSessionDetails.maxParticipantsSpeakWrite,
          })}
        </Text>
      </div>
    );
  };

  const getExamSessionMaxParticipants = () => {
    return examSessionDetails.type === ExamSessionType.FULL
      ? examSessionDetails.maxParticipantsTotal
      : getExamSessionMaxParticipantsPartial();
  };

  const lang = getCurrentLang();
  const location = examSessionDetails.location.find(
    (esl) =>
      (lang === AppLanguage.Finnish && esl.lang === 'fi') ||
      (lang === AppLanguage.Swedish && esl.lang === 'sv') ||
      (lang === AppLanguage.English && esl.lang === 'en'),
  );

  return (
    <div className="rows gapped customer-details">
      <H3>{location && location.name}</H3>
      <div>
        <Text>
          {commonTranslation('languages.' + examSessionDetails.language)}
          {' - '}
          {commonTranslation('languageLevel.' + examSessionDetails.level)}{' '}
          {DateTimeUtils.renderDate(examSessionDetails.date)}:{' '}
          {getExamSessionStartTimesDescription(examSessionDetails)}
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
        </div>
        <div className="rows gapped-xs">
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
          <div className="rows gapped-xs">
            <Label>{commonTranslation('otherLocationInfo')}</Label>
            <div>{location && location.otherLocationInfo}</div>
          </div>
          <div className="rows gapped-xs">
            <Label>{commonTranslation('maxParticipantsTotal')}</Label>
            <div>{getExamSessionMaxParticipants()}</div>
          </div>
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
      {route === 'clerk' && (
        <div>
          <OphButton
            color="primary"
            variant={Variant.Outlined}
            onClick={() => setIsEditModalOpen(true)}
          >
            {t('buttons.edit')}
          </OphButton>
        </div>
      )}
      <ClerkExamSessionEditModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        examSessionDetails={examSessionDetails}
        examDates={examDates}
        route={route}
        oid={oid}
      />
    </div>
  );
};
