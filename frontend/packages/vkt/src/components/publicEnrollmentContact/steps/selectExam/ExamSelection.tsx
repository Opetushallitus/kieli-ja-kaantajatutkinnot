import {
  Collapse,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useEffect } from 'react';
import { AnyAction } from 'redux';
import { H2, LabeledTextField, Text } from 'shared/components';
import { StringUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';

enum YesNo {
  Yes = 'yes',
  No = 'no',
}

export const ExamSelection = ({
  enrollment,
  editingDisabled,
  setValid,
  showValidation,
  updatePublicEnrollment,
}: {
  enrollment: PublicEnrollmentContact;
  editingDisabled: boolean;
  setValid: (isValid: boolean) => void;
  showValidation: boolean;
  updatePublicEnrollment: (
    enrollment: Partial<PublicEnrollmentContact>,
  ) => AnyAction;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollmentContact.steps.selectExam.examSelection',
  });
  const dispatch = useAppDispatch();
  const handleFullExamChange = (_: React.ChangeEvent, v: string) => {
    dispatch(updatePublicEnrollment({ isFullExam: v === YesNo.Yes }));
  };
  const handlePartialExamSelectionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    dispatch(updatePublicEnrollment({ partialExamSelection: e.target.value }));
  };
  const handlePartialExamSelectionBlur = () => {
    if (enrollment.partialExamSelection) {
      dispatch(
        updatePublicEnrollment({
          partialExamSelection: enrollment.partialExamSelection.trim(),
        }),
      );
    }
  };
  const hasFullExamError =
    showValidation && enrollment.isFullExam === undefined;
  const hasPartialExamSelectionError =
    showValidation &&
    enrollment.isFullExam === false &&
    (enrollment.partialExamSelection === undefined ||
      StringUtils.isBlankString(enrollment.partialExamSelection));

  useEffect(() => {
    setValid(!hasFullExamError && !hasPartialExamSelectionError);
  });

  return (
    <div className="rows gapped">
      <div className="public-enrollment-contact__grid__phone-extra-margin margin-top-sm rows gapped">
        <H2>{t('title')}</H2>
        <Text>{t('part1')}</Text>
        <Text>{t('part2')}</Text>
      </div>

      <div className="public-enrollment-contact__grid__phone-extra-margin rows gapped">
        <FormControl component="fieldset">
          <FormLabel
            component="legend"
            className="heading-label margin-bottom-sm"
          >
            {t('fullExam.question')}
          </FormLabel>
          <RadioGroup
            className="margin-top-sm rows gapped-xxs"
            name="full-exam-group"
            value={enrollment.isFullExam ? YesNo.Yes : YesNo.No}
            onChange={handleFullExamChange}
          >
            <FormControlLabel
              disabled={editingDisabled}
              value={YesNo.Yes}
              data-testid="enrollment-checkbox-full-exam"
              control={<Radio aria-describedby="full-exam-error" />}
              label={t('fullExam.yes')}
              checked={enrollment.isFullExam === true}
              className={`margin-left-sm ${
                hasFullExamError && 'checkbox-error'
              }`}
            />
            <FormControlLabel
              disabled={editingDisabled}
              value={YesNo.No}
              control={<Radio aria-describedby="full-exam-error" />}
              label={t('fullExam.no')}
              checked={enrollment.isFullExam === false}
              className={`margin-left-sm ${
                hasFullExamError && 'checkbox-error'
              }`}
            />
          </RadioGroup>
          {hasFullExamError && (
            <FormHelperText id="full-exam-error" error={true}>
              {translateCommon('errors.customTextField.required')}
            </FormHelperText>
          )}
        </FormControl>
        <Collapse in={enrollment.isFullExam === false}>
          <div className="public-enrollment-contact__grid__textfield-container">
            <LabeledTextField
              id="public-enrollment-contact__partial-exam-selection--textField"
              label={t('selectExams.heading')}
              placeholder={t('selectExams.description')}
              value={enrollment.partialExamSelection || ''}
              onBlur={handlePartialExamSelectionBlur}
              onChange={handlePartialExamSelectionChange}
              error={hasPartialExamSelectionError}
              helperText={translateCommon('errors.customTextField.required')}
              disabled={editingDisabled}
            />
          </div>
        </Collapse>
      </div>
    </div>
  );
};
