import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { ChangeEvent, useCallback, useEffect } from 'react';
import { Trans } from 'react-i18next';
import {
  CustomButton,
  FileUpload,
  H3,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  Attachment,
  Education,
  EducationType,
  FreeBasisSource,
  HandleChange,
  PublicFreeEnrollmentBasis,
} from 'interfaces/publicEducation';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { loadPublicEducation } from 'redux/reducers/publicEducation';
import {
  removeUploadedFileAttachment,
  updatePublicEnrollment,
} from 'redux/reducers/publicEnrollment';
import { startFileUpload } from 'redux/reducers/publicFileUpload';
import { publicEducationSelector } from 'redux/selectors/publicEducation';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { publicFileUploadSelector } from 'redux/selectors/publicFileUpload';
import { EnrollmentUtils } from 'utils/enrollment';
import { FileUtils } from 'utils/file';

const getAttachmentsCount = (enrollment: PublicEnrollment): number => {
  if (enrollment.freeEnrollmentBasis?.attachments) {
    return enrollment.freeEnrollmentBasis.attachments.length;
  }

  return 0;
};

type AttachmentType = 'pdf' | 'image';

const getAttachmentType = (attachment: Attachment): AttachmentType => {
  if (attachment.name.endsWith('.pdf')) {
    return 'pdf';
  }

  return 'image';
};

const AttachmentsList = () => {
  const { freeEnrollmentBasis } = useAppSelector(
    publicEnrollmentSelector,
  ).enrollment;
  const dispatch = useAppDispatch();
  const { showDialog } = useDialog();

  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollment.steps.educationDetails.uploadAttachment',
  });

  if (!freeEnrollmentBasis?.attachments) {
    return null;
  }

  const confirmDeleteAttachment = (attachment: Attachment) => {
    showDialog({
      title: t('deleteAttachment.title'),
      severity: Severity.Error,
      content: (
        <Text>
          <Trans
            t={t}
            i18nKey="deleteAttachment.description"
            components={[<b key={`delete-attachment-b-${attachment.id}`} />]}
            values={{ fileName: attachment.name }}
          />
        </Text>
      ),
      actions: [
        {
          title: translateCommon('cancel'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('delete'),
          buttonColor: Color.Error,
          variant: Variant.Contained,
          action: () => dispatch(removeUploadedFileAttachment(attachment)),
        },
      ],
    });
  };

  return (
    <>
      <H3>{t('attachmentsList.title')}:</H3>
      <div className="rows">
        {freeEnrollmentBasis.attachments.map((a) => (
          <div key={a.id} className="columns gapped-xs">
            {getAttachmentType(a) === 'pdf' ? (
              <PictureAsPdfIcon />
            ) : (
              <ImageIcon />
            )}
            <Text className="grow">
              {a.name}&nbsp;({FileUtils.getReadableFileSize(a.size)})
            </Text>
            <CustomButton
              startIcon={<DeleteIcon />}
              onClick={() => confirmDeleteAttachment(a)}
              color={Color.Error}
              variant={Variant.Text}
            >
              {translateCommon('delete')}
            </CustomButton>
          </div>
        ))}
      </div>
    </>
  );
};

const UploadAttachments = ({
  isAttachmentsValid,
  showValidation,
}: {
  isAttachmentsValid: boolean;
  showValidation: boolean;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollment.steps.educationDetails.uploadAttachment',
  });

  const enrollment = useAppSelector(publicEnrollmentSelector).enrollment;
  const attachmentsCount = getAttachmentsCount(enrollment);

  const dispatch = useAppDispatch();
  const { id } = useAppSelector(publicEnrollmentSelector)
    .examEvent as PublicExamEvent;
  const showError = showValidation && !isAttachmentsValid;

  const { status: fileUploadStatus } = useAppSelector(publicFileUploadSelector);

  const handleFileUpload = (files: FileList) => {
    if (files.length > 0) {
      dispatch(startFileUpload({ file: files[0], examEventId: id }));
    }
  };

  return (
    <div className="rows gapped">
      <H3>{t('title')}</H3>
      <Text>
        {t('helpText1')}
        <br />
        {t('helpText2')}
      </Text>
      <div className="rows">
        <Text>{t('instructions.title')}</Text>
        <ul style={{ marginTop: 0 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Typography key={i} component="li" variant="body1">
              {t('instructions.part' + i)}
            </Typography>
          ))}
        </ul>
      </div>
      {attachmentsCount < 10 && (
        <LoadingProgressIndicator
          isLoading={fileUploadStatus === APIResponseStatus.InProgress}
        >
          <FileUpload
            accept="application/pdf,image/jpeg,image/png,image/heic,image/tiff,image/webp"
            onChange={handleFileUpload}
            error={showError}
            buttonText={t('uploadFile')}
            dropZoneText={t('dropFile')}
          />
        </LoadingProgressIndicator>
      )}
      {attachmentsCount >= 10 && (
        <Text>
          <b>{t('maxAttachmentsReached')}</b>
        </Text>
      )}
      <AttachmentsList />
      {showError && (
        <FormHelperText id="has-select-education-error" error={true}>
          {translateCommon('errors.customTextField.required')}
        </FormHelperText>
      )}
    </div>
  );
};

const SelectEducation = ({
  enrollment,
  handleChange,
  showValidation,
  isEducationValid,
}: {
  enrollment: PublicEnrollment;
  handleChange: HandleChange;
  showValidation: boolean;
  isEducationValid: boolean;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.educationDetails',
  });

  const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleChange(event.target.value !== EducationType.None, {
      type: event.target.value as EducationType,
      source: FreeBasisSource.User,
    });
  };

  const selectedType =
    enrollment.freeEnrollmentBasis && enrollment.freeEnrollmentBasis.type;

  const showError = showValidation && !isEducationValid;

  return (
    <div className="rows gapped">
      <Text>{t('educationSelectHelpText')}</Text>
      <Text>{t('educationSelectChooseOne')}</Text>
      <fieldset className="public-enrollment__grid__education-details margin-top-sm">
        <legend>
          <H3>{t('education')}</H3>
        </legend>
        <FormControl error={showError}>
          <RadioGroup onChange={handleRadioChange}>
            <FormControlLabel
              value={EducationType.None}
              control={<Radio />}
              label={t('no')}
              checked={selectedType === EducationType.None}
              className={`radio-group-label ${showError && 'checkbox-error'}`}
            />
            <FormControlLabel
              value={EducationType.MatriculationExam}
              control={<Radio />}
              label={t('highschool')}
              checked={selectedType === EducationType.MatriculationExam}
              className={`radio-group-label ${showError && 'checkbox-error'}`}
            />
            <FormControlLabel
              value={EducationType.HigherEducationConcluded}
              control={<Radio />}
              label={t('college')}
              checked={selectedType === EducationType.HigherEducationConcluded}
              className={`radio-group-label ${showError && 'checkbox-error'}`}
            />
            <FormControlLabel
              value={EducationType.HigherEducationEnrolled}
              control={<Radio />}
              label={t('collegeEnrolled')}
              checked={selectedType === EducationType.HigherEducationEnrolled}
              className={`radio-group-label ${showError && 'checkbox-error'}`}
            />
          </RadioGroup>
          {showError && (
            <FormHelperText id="has-select-education-error" error={true}>
              {translateCommon('errors.customTextField.required')}
            </FormHelperText>
          )}
        </FormControl>
      </fieldset>
    </div>
  );
};

const EducationList = ({
  educations,
  handleChange,
}: {
  educations: Array<Education>;
  handleChange: HandleChange;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollment.steps.fillContactDetails.educationDetails',
  });

  useEffect(() => {
    if (educations && educations.length > 0) {
      handleChange(true, {
        type: (educations && educations[0].name) || EducationType.Unknown,
        source: FreeBasisSource.KOSKI,
      });
    } else {
      handleChange(false, undefined);
    }
  }, [educations, handleChange]);

  return (
    <div className="rows gapped">
      <Text>{t('freeEnrollmentDescription')}</Text>
      <ul className="public-enrollment__grid__preview__bullet-list">
        {educations.map((education) => (
          <li key={`education-type-${education.name}`}>
            <Text className="bold">{t(`type.${education.name}`)}</Text>
          </li>
        ))}
      </ul>
      <Text>{t('freeEnrollmentDescription2')}</Text>
    </div>
  );
};

export const EducationDetails = ({
  showValidation,
  isLoading,
  setIsStepValid,
  enrollment,
}: {
  showValidation: boolean;
  isLoading: boolean;
  setIsStepValid: (isValid: boolean) => void;
  enrollment: PublicEnrollment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollment.steps.fillContactDetails.educationDetails',
  });
  const dispatch = useAppDispatch();

  const { freeEnrollmentDetails } = useAppSelector(publicEnrollmentSelector);
  const { status: educationStatus, education: educations } = useAppSelector(
    publicEducationSelector,
  );
  const { freeEnrollmentBasis } = enrollment;

  useEffect(() => {
    if (educationStatus === APIResponseStatus.NotStarted) {
      dispatch(loadPublicEducation());
    }
  }, [educationStatus, educations, dispatch]);

  const isEducationLoading =
    educationStatus === APIResponseStatus.InProgress ||
    educationStatus === APIResponseStatus.NotStarted;

  const foundSuitableEducationDetails =
    !isEducationLoading && educations && educations.length > 0;

  const attachmentsRequired =
    freeEnrollmentBasis &&
    freeEnrollmentBasis.source === FreeBasisSource.User &&
    freeEnrollmentBasis.type !== EducationType.None;

  const isEducationValid =
    !!freeEnrollmentBasis &&
    EnrollmentUtils.isValidFreeBasisIfRequired(
      enrollment,
      freeEnrollmentDetails,
    );
  const isAttachmentsValid =
    EnrollmentUtils.isValidAttachmentsIfRequired(enrollment);

  const handleEductionChangeFn: HandleChange = (
    isFree: boolean,
    freeEnrollmentBasis?: PublicFreeEnrollmentBasis,
  ) => {
    dispatch(
      updatePublicEnrollment({
        isFree,
        freeEnrollmentBasis,
      }),
    );
  };
  const handleEducationChange = useCallback(handleEductionChangeFn, [dispatch]);

  useEffect(() => {
    setIsStepValid(isEducationValid && isAttachmentsValid),
      [setIsStepValid, isEducationValid, isAttachmentsValid];
  });

  return (
    <div className="rows gapped">
      {isEducationLoading && showValidation && (
        <FormHelperText
          className="margin-bottom-lg"
          id="education-loading-error"
          error={true}
        >
          {t('errorWaitEducations')}
        </FormHelperText>
      )}
      <LoadingProgressIndicator
        isLoading={isLoading || isEducationLoading}
        displayBlock={true}
      >
        {foundSuitableEducationDetails && (
          <EducationList
            handleChange={handleEducationChange}
            educations={educations}
          />
        )}
        {!isLoading &&
          !isEducationLoading &&
          !foundSuitableEducationDetails && (
            <>
              <SelectEducation
                enrollment={enrollment}
                handleChange={handleEducationChange}
                showValidation={showValidation}
                isEducationValid={isEducationValid}
              />
              {attachmentsRequired && (
                <UploadAttachments
                  showValidation={showValidation}
                  isAttachmentsValid={isAttachmentsValid}
                />
              )}
            </>
          )}
      </LoadingProgressIndicator>
    </div>
  );
};
