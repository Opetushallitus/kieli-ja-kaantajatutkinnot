import { Checkbox, FormControlLabel } from '@mui/material';
import { useEffect } from 'react';
import { H3 } from 'shared/components';
import { Color } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { updatePublicEnrollment } from 'redux/reducers/publicEnrollment';
import { EnrollmentUtils } from 'utils/enrollment';

const CheckboxField = ({
  enrollment,
  fieldName,
  onClick,
  disabled,
}: {
  enrollment: PublicEnrollment;
  fieldName: keyof PartialExamsAndSkills;
  onClick: (fieldName: keyof PartialExamsAndSkills) => void;
  disabled: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollment.steps.partialExamsSelection.fields',
  });

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
      label={t(fieldName)}
    />
  );
};

export const PartialExamsSelection = ({
  enrollment,
  editingDisabled,
  setValid,
}: {
  enrollment: PublicEnrollment;
  editingDisabled: boolean;
  setValid?: (disabled: boolean) => void;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.partialExamsSelection',
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (setValid) {
      setValid(EnrollmentUtils.isValidPartialExamsAndSkills(enrollment));
    }
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
    } else if (
      fieldName === 'understandingSkill' &&
      enrollment.understandingSkill
    ) {
      if (!enrollment.oralSkill) {
        partialExamsToUncheck.push('speakingPartialExam');
        partialExamsToUncheck.push('speechComprehensionPartialExam');
      }
      if (!enrollment.textualSkill) {
        partialExamsToUncheck.push('writingPartialExam');
        partialExamsToUncheck.push('readingComprehensionPartialExam');
      }
    }

    togglePartialExam(fieldName);
    partialExamsToUncheck.forEach(uncheckPartialExam);
  };

  const togglePartialExam = (fieldName: keyof PartialExamsAndSkills) => {
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

  return (
    <div className="margin-top-lg rows gapped">
      <div className="rows gapped-sm">
        <H3>{t('skillsTitle')}</H3>
        <div className="public-enrollment__grid__partial-exam-selection rows">
          <CheckboxField
            enrollment={enrollment}
            fieldName={'textualSkill'}
            onClick={toggleSkill}
            disabled={editingDisabled}
          />
          <CheckboxField
            enrollment={enrollment}
            fieldName={'oralSkill'}
            onClick={toggleSkill}
            disabled={editingDisabled}
          />
          <CheckboxField
            enrollment={enrollment}
            fieldName={'understandingSkill'}
            onClick={toggleSkill}
            disabled={editingDisabled}
          />
        </div>
      </div>
      <div className="public-enrollment__grid__partial-exam-selection">
        <div className="rows gapped-sm">
          <H3>{t('partialExamsTitle')}</H3>
          <div className="grid-columns">
            <CheckboxField
              enrollment={enrollment}
              fieldName={'writingPartialExam'}
              onClick={togglePartialExam}
              disabled={!enrollment.textualSkill || editingDisabled}
            />
            <CheckboxField
              enrollment={enrollment}
              fieldName={'readingComprehensionPartialExam'}
              onClick={togglePartialExam}
              disabled={
                (!enrollment.textualSkill && !enrollment.understandingSkill) ||
                editingDisabled
              }
            />
            <CheckboxField
              enrollment={enrollment}
              fieldName={'speakingPartialExam'}
              onClick={togglePartialExam}
              disabled={!enrollment.oralSkill || editingDisabled}
            />
            <CheckboxField
              enrollment={enrollment}
              fieldName={'speechComprehensionPartialExam'}
              onClick={togglePartialExam}
              disabled={
                (!enrollment.oralSkill && !enrollment.understandingSkill) ||
                editingDisabled
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
