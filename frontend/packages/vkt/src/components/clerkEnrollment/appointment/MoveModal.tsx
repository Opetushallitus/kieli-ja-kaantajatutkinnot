import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
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
import { ComboBoxOption } from 'shared/interfaces';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { useExamEventDescription } from 'hooks/useExamEventDescription';
import { ClerkEnrollmentAppointment } from 'interfaces/clerkEnrollment';
import { ExaminerExamEvent } from 'interfaces/examinerExamEvent';
import {
  moveEnrollment,
  resetMoveEnrollment,
} from 'redux/reducers/clerkEnrollmentAppointment';
import {
  loadExaminerExamEvents,
  resetClerkEnrollmentContactRequestToInitialState,
} from 'redux/reducers/clerkEnrollmentContactRequest';
import { resetExaminerDetailsToInitialState } from 'redux/reducers/examinerDetails';
import { clerkEnrollmentAppointmentSelector } from 'redux/selectors/clerkEnrollmentAppointment';
import { clerkEnrollmentContactRequestSelector } from 'redux/selectors/clerkEnrollmentContactRequest';

interface MoveModalProps {
  enrollment: ClerkEnrollmentAppointment;
  onCancel: () => void;
  oid: string;
}

export const MoveModal: FC<MoveModalProps> = ({
  enrollment,
  onCancel,
  oid,
}) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentDetails.moveModal',
  });
  const translateCommon = useCommonTranslation();
  const describeExamEvent = useExamEventDescription();

  const [selectedExamEventOption, setSelectedExamEventOption] =
    useState<ComboBoxOption | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { moveStatus } = useAppSelector(clerkEnrollmentAppointmentSelector);
  const { examEventsStatus, examEvents } = useAppSelector(
    clerkEnrollmentContactRequestSelector,
  );
  const examEvent = enrollment.examEvent;

  useEffect(() => {
    if (examEventsStatus === APIResponseStatus.NotStarted) {
      dispatch(loadExaminerExamEvents(oid));
    }
  }, [dispatch, examEventsStatus, oid]);

  useEffect(() => {
    if (moveStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('successToast'),
      });
      dispatch(resetMoveEnrollment());
      dispatch(resetClerkEnrollmentContactRequestToInitialState());
      dispatch(resetExaminerDetailsToInitialState());
      navigate(AppRoutes.ExaminerHomePage.replace(':oid', oid), {
        replace: true,
      });
    }
  }, [dispatch, navigate, showToast, oid, t, moveStatus]);

  const isLoading = moveStatus === APIResponseStatus.InProgress;

  const getComboBoxOption = (e: ExaminerExamEvent) => {
    return {
      label: describeExamEvent(e),
      value: `${e.id}`,
    };
  };

  const selectableExamEventOptions = examEvents
    .filter(
      (e: ExaminerExamEvent) =>
        examEvent && e.language === examEvent.language && e.id !== examEvent.id,
    )
    .reverse()
    .map(getComboBoxOption);

  const handleExamEventOptionChange = (value?: string) => {
    if (value) {
      const selected = selectableExamEventOptions.filter(
        (v: ComboBoxOption) => v.value === value,
      );
      if (selected.length > 0) {
        setSelectedExamEventOption(selected[0]);
      }
    } else {
      setSelectedExamEventOption(null);
    }
  };

  const handleMoveButtonClick = () => {
    if (selectedExamEventOption) {
      dispatch(
        moveEnrollment({
          id: enrollment.id,
          version: enrollment.version,
          toExamEventId: Number(selectedExamEventOption.value),
          oid: oid,
        }),
      );
    }
  };

  return (
    <div className="examiner-enrollment-details__move-modal">
      <div className="rows gapped-xs">
        <H3>{t('newExamEvent')}</H3>
        <ComboBox
          className="examiner-enrollment-details__move-modal__combobox"
          data-testid="examiner-enrollment-details__move-modal__exam-date"
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
          data-testid="examiner-enrollment-details__move-modal__cancel-button"
          className="margin-right-xs"
          onClick={onCancel}
          variant={Variant.Text}
          color={Color.Secondary}
        >
          {translateCommon('cancel')}
        </CustomButton>
        <LoadingProgressIndicator isLoading={isLoading}>
          <CustomButton
            data-testid="examiner-enrollment-details__move-modal__save-button"
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
