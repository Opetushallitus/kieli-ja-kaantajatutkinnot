import {
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { H3 } from 'shared/components';
import { Color } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';
import { EnrollmentUtils } from 'utils/enrollment';

enum YesNo {
  Yes = 'yes',
  No = 'no',
}

const CheckboxField = ({
  enrollment,
  fieldName,
  onClick,
  disabled,
  error,
}: {
  enrollment: PublicEnrollment;
  fieldName: keyof PartialExamsAndSkills;
  onClick: (fieldName: keyof PartialExamsAndSkills) => void;
  disabled: boolean;
  error: boolean;
}) => {
  const translateCommon = useCommonTranslation();

  return (
    <FormControlLabel
      control={
        <Checkbox
          onClick={() => onClick(fieldName)}
          color={Color.Secondary}
          checked={enrollment[fieldName]}
          disabled={disabled}
        />
      }
      label={translateCommon(`enrollment.partialExamsAndSkills.${fieldName}`)}
      className={error ? 'checkbox-error' : ''}
    />
  );
};

export const PartialExamsSelection = ({
  enrollment,
  editingDisabled,
  setValid,
  showValidation,
}: {
  enrollment: PublicEnrollment;
  editingDisabled: boolean;
  setValid: (disabled: boolean) => void;
  showValidation: boolean;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.partialExamsSelection',
  });

  const [dirtyFullExam, setDirtyFullExam] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    setValid(EnrollmentUtils.isValidPartialExamsAndSkills(enrollment));
  }, [setValid, enrollment]);

  const toggleSkill = (fieldName: keyof PartialExamsAndSkills) => {
    const partialExamsToUncheck: Array<keyof PartialExamsAndSkills> = [];

    if (fieldName === 'oralSkill' && enrollment.oralSkill) {
      partialExamsToUncheck.push('speakingPartialExam');
      !enrollment.understandingSkill &&
        partialExamsToUncheck.push('speechComprehensionPartialExam');
    } else if (fieldName === 'textualSkill' && enrollment.textualSkill) {
      partialExamsToUncheck.push('writingPartialExam');
      !enrollment.understandingSkill &&
        partialExamsToUncheck.push('readingComprehensionPartialExam');
    }

    toggleField(fieldName);
    partialExamsToUncheck.forEach(uncheckPartialExam);
  };

  const toggleField = (fieldName: keyof PartialExamsAndSkills) => {
    dispatch(
      updatePublicEnrollment({
        [fieldName]: !enrollment[fieldName],
      })
    );
  };

  const uncheckPartialExam = (fieldName: keyof PartialExamsAndSkills) => {
    dispatch(
      updatePublicEnrollment({
        [fieldName]: false,
      })
    );
  };

  const handleFullExamChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.value === YesNo.Yes;

    setDirtyFullExam(true);

    dispatch(
      updatePublicEnrollment({
        textualSkill: checked,
        oralSkill: checked,
        speakingPartialExam: checked,
        speechComprehensionPartialExam: checked,
        writingPartialExam: checked,
        readingComprehensionPartialExam: checked,
      })
    );
  };

  const allChecked =
    enrollment.speakingPartialExam &&
    enrollment.speechComprehensionPartialExam &&
    enrollment.writingPartialExam &&
    enrollment.readingComprehensionPartialExam;

  const someChecked =
    enrollment.speakingPartialExam ||
    enrollment.speechComprehensionPartialExam ||
    enrollment.writingPartialExam ||
    enrollment.readingComprehensionPartialExam;

  const hasFullExamError = showValidation && !dirtyFullExam;
  const hasSkillError =
    showValidation && !enrollment.oralSkill && !enrollment.textualSkill;
  const hasSpeakingExamError =
    showValidation &&
    !enrollment.speakingPartialExam &&
    !enrollment.speechComprehensionPartialExam;
  const hasWritingExamError =
    showValidation &&
    !enrollment.writingPartialExam &&
    !enrollment.readingComprehensionPartialExam;

  return (
    <div className="rows gapped">
      <FormControl component="fieldset">
        <FormLabel component="legend" className="heading-label">
          {t('doFullExam')}
        </FormLabel>
        <RadioGroup
          name="full-exam-group"
          value={enrollment.hasPreviousEnrollment ? YesNo.Yes : YesNo.No}
          onChange={handleFullExamChange}
        >
          <FormControlLabel
            disabled={editingDisabled}
            value={YesNo.Yes}
            control={<Radio aria-describedby="full-exam-error" />}
            label={t('yesFullExam')}
            checked={allChecked}
            className={`public-enrollment__grid__previous-enrollment__selection-label ${
              hasFullExamError && 'checkbox-error'
            }`}
          />
          <FormControlLabel
            disabled={editingDisabled}
            value={YesNo.No}
            control={<Radio aria-describedby="full-exam-error" />}
            label={t('noFullExam')}
            checked={(dirtyFullExam || someChecked) && !allChecked}
            className={`public-enrollment__grid__previous-enrollment__selection-label ${
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
      <Collapse orientation="vertical" in={dirtyFullExam && !allChecked}>
        <div className="rows gapped-sm">
          <H3>{t('skillsTitle')}</H3>
          <div className="public-enrollment__grid__partial-exam-selection rows">
            <CheckboxField
              enrollment={enrollment}
              fieldName={'textualSkill'}
              onClick={toggleSkill}
              disabled={editingDisabled}
              error={hasSkillError}
            />
            <CheckboxField
              enrollment={enrollment}
              fieldName={'oralSkill'}
              onClick={toggleSkill}
              disabled={editingDisabled}
              error={hasSkillError}
            />
          </div>
          {hasSkillError && (
            <FormHelperText id="has-previous-enrollment-error" error={true}>
              {translateCommon('errors.customTextField.required')}
            </FormHelperText>
          )}
        </div>
      </Collapse>
      <div className="columns">
        <Collapse
          orientation="vertical"
          in={enrollment.textualSkill && !allChecked}
          className="grid-columns public-enrollment__grid__partial-exam-selection"
        >
          <div className="rows gapped-sm">
            <H3>{t('writingSkill')}</H3>
            <CheckboxField
              enrollment={enrollment}
              fieldName={'writingPartialExam'}
              onClick={toggleField}
              disabled={editingDisabled}
              error={hasWritingExamError}
            />
            <CheckboxField
              enrollment={enrollment}
              fieldName={'readingComprehensionPartialExam'}
              onClick={toggleField}
              disabled={editingDisabled}
              error={hasWritingExamError}
            />
          </div>
          {hasWritingExamError && (
            <FormHelperText id="has-previous-enrollment-error" error={true}>
              {translateCommon('errors.customTextField.required')}
            </FormHelperText>
          )}
        </Collapse>
        <Collapse
          orientation="vertical"
          in={enrollment.oralSkill && !allChecked}
          className="grid-columns public-enrollment__grid__partial-exam-selection"
        >
          <div className="rows gapped-sm">
            <H3>{t('speakingSkill')}</H3>
            <CheckboxField
              enrollment={enrollment}
              fieldName={'speakingPartialExam'}
              onClick={toggleField}
              disabled={editingDisabled}
              error={hasSpeakingExamError}
            />
            <CheckboxField
              enrollment={enrollment}
              fieldName={'speechComprehensionPartialExam'}
              onClick={toggleField}
              disabled={editingDisabled}
              error={hasSpeakingExamError}
            />
          </div>
          {hasSpeakingExamError && (
            <FormHelperText id="has-previous-enrollment-error" error={true}>
              {translateCommon('errors.customTextField.required')}
            </FormHelperText>
          )}
        </Collapse>
      </div>
    </div>
  );
};
