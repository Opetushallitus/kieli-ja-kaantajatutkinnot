import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComboBox,
  CustomButton,
  H3,
  LoadingProgressIndicator,
} from 'shared/components';
import {
  APIResponseStatus,
  Color,
  Severity,
  TextFieldVariant,
  Variant,
} from 'shared/enums';
import { useToast } from 'shared/hooks';
import { AutocompleteValue, ComboBoxOption } from 'shared/interfaces';
import { DateUtils } from 'shared/utils';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ClerkEnrollment } from 'interfaces/clerkEnrollment';
import { ClerkListExamEvent } from 'interfaces/clerkListExamEvent';
import {
  moveEnrollment,
  resetMoveEnrollment,
} from 'redux/reducers/clerkEnrollmentDetails';
import {
  loadExamEvents,
  resetClerkListExamEvent,
} from 'redux/reducers/clerkListExamEvent';
import { clerkEnrollmentDetailsSelector } from 'redux/selectors/clerkEnrollmentDetails';
import { clerkExamEventOverviewSelector } from 'redux/selectors/clerkExamEventOverview';
import { clerkListExamEventsSelector } from 'redux/selectors/clerkListExamEvent';
import { ExamEventUtils } from 'utils/examEvent';

interface MoveModalProps {
  enrollment: ClerkEnrollment;
  onCancel: () => void;
}

export const MoveModal: FC<MoveModalProps> = ({ enrollment, onCancel }) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentDetails.moveModal',
  });
  const translateCommon = useCommonTranslation();

  const [selectedExamEventOption, setSelectedExamEventOption] =
    useState<ComboBoxOption | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { moveStatus } = useAppSelector(clerkEnrollmentDetailsSelector);
  const { status: examEventListStatus, examEvents } = useAppSelector(
    clerkListExamEventsSelector
  );
  const { examEvent } = useAppSelector(clerkExamEventOverviewSelector);

  useEffect(() => {
    if (examEventListStatus === APIResponseStatus.NotStarted) {
      dispatch(loadExamEvents());
    }
  }, [dispatch, examEventListStatus]);

  useEffect(() => {
    if (moveStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('successToast'),
      });
      dispatch(resetMoveEnrollment());
      dispatch(resetClerkListExamEvent());
      navigate(AppRoutes.ClerkHomePage, { replace: true });
    }
  }, [dispatch, navigate, showToast, t, moveStatus]);

  if (!examEvent) {
    return null;
  }

  const isLoading = moveStatus === APIResponseStatus.InProgress;

  const getComboBoxOption = (e: ClerkListExamEvent) => {
    return {
      label: `${ExamEventUtils.languageAndLevelText(
        e.language,
        e.level,
        translateCommon
      )} ${DateUtils.formatOptionalDate(e.date)} - ${t('fillings')} ${
        e.participants
      } / ${e.maxParticipants}`,
      value: `${e.id}`,
    };
  };

  const selectableExamEventOptions = examEvents
    .filter((e) => e.language === examEvent.language && e.id !== examEvent.id)
    .reverse()
    .map(getComboBoxOption);

  const handleExamEventOptionChange = ({}, value: AutocompleteValue) => {
    setSelectedExamEventOption(value as ComboBoxOption);
  };

  const handleMoveButtonClick = () => {
    if (selectedExamEventOption) {
      dispatch(
        moveEnrollment({
          id: enrollment.id,
          version: enrollment.version,
          toExamEventId: Number(selectedExamEventOption.value),
        })
      );
    }
  };

  return (
    <div className="clerk-enrollment-details__move-modal">
      <div className="rows gapped-xs">
        <H3>{t('newExamEvent')}</H3>
        <ComboBox
          className="clerk-enrollment-details__move-modal__combobox"
          data-testid="clerk-enrollment-details__move-modal__exam-date"
          autoHighlight
          label={translateCommon('choose')}
          values={selectableExamEventOptions}
          value={selectedExamEventOption}
          variant={TextFieldVariant.Outlined}
          onChange={handleExamEventOptionChange}
        />
      </div>
      <div className="columns gapped margin-top-lg flex-end">
        <CustomButton
          disabled={isLoading}
          data-testid="clerk-enrollment-details__move-modal__cancel-button"
          className="margin-right-xs"
          onClick={onCancel}
          variant={Variant.Text}
          color={Color.Secondary}
        >
          {translateCommon('cancel')}
        </CustomButton>
        <LoadingProgressIndicator isLoading={isLoading}>
          <CustomButton
            data-testid="clerk-enrollment-details__move-modal__save-button"
            variant={Variant.Contained}
            color={Color.Secondary}
            onClick={handleMoveButtonClick}
            disabled={!selectedExamEventOption || isLoading}
          >
            {t('move')}
          </CustomButton>
        </LoadingProgressIndicator>
      </div>
    </div>
  );
};
