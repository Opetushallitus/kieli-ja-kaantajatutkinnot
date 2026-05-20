import { InfoOutlined as InfoIcon } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {
  Collapse,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { AnyAction } from 'redux';
import {
  CustomButton,
  FileUpload,
  H2,
  H3,
  LoadingProgressIndicator,
  Text,
  WebLink,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { Attachment } from 'interfaces/publicEducation';
import { PublicEnrollmentCommon } from 'interfaces/publicEnrollment';
import {
  removeContactAttachment,
  updatePublicEnrollmentContact,
} from 'redux/reducers/publicEnrollmentContact';
import { startContactFileUpload } from 'redux/reducers/publicFileUpload';
import { publicEnrollmentContactSelector } from 'redux/selectors/publicEnrollmentContact';
import { publicFileUploadSelector } from 'redux/selectors/publicFileUpload';
import { FileUtils } from 'utils/file';

enum PreviouslyEnrolled {
  Yes = 'yes',
  No = 'no',
}

const getAttachmentType = (attachment: Attachment): 'pdf' | 'image' => {
  if (attachment.name.endsWith('.pdf')) {
    return 'pdf';
  }

  return 'image';
};

const AttachmentsList = ({
  attachments,
}: {
  attachments: Array<Attachment>;
}) => {
  const dispatch = useAppDispatch();
  const { showDialog } = useDialog();
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollmentContact.steps.selectExam.previousEnrollment.uploadAttachment',
  });

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
          action: () => dispatch(removeContactAttachment(attachment)),
        },
      ],
    });
  };

  return (
    <>
      {attachments.map((a) => (
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
    </>
  );
};

const UploadPreviousEnrollmentAttachment = ({
  attachments,
  showValidation,
  examinerId,
}: {
  attachments: Array<Attachment>;
  showValidation: boolean;
  examinerId: number;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollmentContact.steps.selectExam.previousEnrollment.uploadAttachment',
  });

  const dispatch = useAppDispatch();
  const { status: fileUploadStatus } = useAppSelector(publicFileUploadSelector);
  const isAttachmentsValid = attachments.length > 0;
  const showError = showValidation && !isAttachmentsValid;

  const handleFileUpload = (files: FileList) => {
    if (files.length > 0) {
      dispatch(startContactFileUpload({ file: files[0], examinerId }));
    }
  };

  return (
    <div className="rows gapped">
      <H3>{t('title')} *</H3>
      <Text>{t('helpText')}</Text>
      <div className="rows">
        <ul style={{ marginTop: 0 }}>
          {[1, 2, 3].map((i) => (
            <Typography key={i} component="li" variant="body1">
              {t('instructions.part' + i)}
            </Typography>
          ))}
        </ul>
      </div>
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
      <AttachmentsList attachments={attachments} />
      {showError && (
        <FormHelperText id="contact-attachment-error" error={true}>
          {translateCommon('errors.customTextField.required')}
        </FormHelperText>
      )}
    </div>
  );
};

export const PreviousEnrollment = ({
  enrollment,
  editingDisabled,
  setValid,
  showValidation,
  updatePublicEnrollment,
}: {
  enrollment: PublicEnrollmentCommon;
  editingDisabled: boolean;
  setValid: (isValid: boolean) => void;
  showValidation: boolean;
  updatePublicEnrollment: (
    enrollment: Partial<PublicEnrollmentCommon>,
  ) => AnyAction;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollmentContact.steps.selectExam.previousEnrollment',
  });

  const dispatch = useAppDispatch();
  const { examiner, enrollment: contactEnrollment } = useAppSelector(
    publicEnrollmentContactSelector,
  );
  const attachments = useMemo(
    () => contactEnrollment.attachments ?? [],
    [contactEnrollment.attachments],
  );
  const examinerId = examiner?.id ?? 0;

  useEffect(() => {
    if (enrollment.hasPreviousEnrollment === undefined) {
      setValid(false);

      return;
    }

    if (enrollment.hasPreviousEnrollment === false) {
      setValid(false);

      return;
    }

    setValid(attachments.length > 0);
  }, [setValid, enrollment, attachments]);

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const hasPreviousEnrollment = event.target.value === PreviouslyEnrolled.Yes;

    dispatch(
      updatePublicEnrollment({
        hasPreviousEnrollment,
      }),
    );

    if (!hasPreviousEnrollment) {
      dispatch(updatePublicEnrollmentContact({ attachments: [] }));
    }
  };

  const hasNoSelectionError =
    showValidation && enrollment.hasPreviousEnrollment === undefined;
  const hasNoEnrollmentError =
    showValidation && enrollment.hasPreviousEnrollment === false;
  const hasRadioButtonError = hasNoSelectionError || hasNoEnrollmentError;

  return (
    <div className="rows gapped">
      <div className="public-enrollment-contact__grid__phone-extra-margin margin-top-sm rows gapped">
        <H2>{t('title')}</H2>
        <Text>{t('part1')}</Text>
      </div>
      <div className="public-enrollment-contact__grid__phone-extra-margin rows gapped">
        <FormControl component="fieldset">
          <FormLabel
            component="legend"
            className="heading-label margin-bottom-sm"
          >
            {t('radioButtons.label')}
          </FormLabel>
          <RadioGroup
            className="margin-top-sm"
            name="has-previous-enrollment-group"
            value={
              enrollment.hasPreviousEnrollment
                ? PreviouslyEnrolled.Yes
                : PreviouslyEnrolled.No
            }
            onChange={handleRadioButtonChange}
          >
            <FormControlLabel
              disabled={editingDisabled}
              data-testid="enrollment-checkbox-previously-enrolled-no"
              value={PreviouslyEnrolled.No}
              control={
                <Radio aria-describedby="has-previous-enrollment-error" />
              }
              label={t('hasPreviousEnrollment.no')}
              checked={enrollment.hasPreviousEnrollment === false}
              className={`margin-left-sm ${
                hasRadioButtonError && 'checkbox-error'
              }`}
            />
            <FormControlLabel
              disabled={editingDisabled}
              data-testid="enrollment-checkbox-previously-enrolled-yes"
              value={PreviouslyEnrolled.Yes}
              control={
                <Radio aria-describedby="has-previous-enrollment-error" />
              }
              label={t('hasPreviousEnrollment.yes')}
              checked={enrollment.hasPreviousEnrollment}
              className={`margin-left-sm ${
                hasRadioButtonError && 'checkbox-error'
              }`}
            />
          </RadioGroup>
          {hasRadioButtonError && (
            <FormHelperText id="has-previous-enrollment-error" error={true}>
              {hasNoEnrollmentError
                ? t('noEnrollmentError')
                : translateCommon('errors.customTextField.required')}
            </FormHelperText>
          )}
        </FormControl>
      </div>
      <Collapse
        orientation="vertical"
        in={enrollment.hasPreviousEnrollment === false}
      >
        <div className="public-enrollment-contact__grid__previous-enrollment-info-box rows gapped margin-top-sm">
          <div className="public-enrollment-contact__grid__previous-enrollment-info-box__header columns">
            <InfoIcon color="secondary" />
            <Text>{t('noEnrollmentInfoBox.line1')}</Text>
          </div>
          <Text className="public-enrollment-contact__grid__previous-enrollment-info-box__body">
            {t('noEnrollmentInfoBox.line2')}
          </Text>
          <Text className="public-enrollment-contact__grid__previous-enrollment-info-box__body">
            {t('noEnrollmentInfoBox.readMore')}{' '}
            <WebLink
              href={t('noEnrollmentInfoBox.url')}
              label={t('noEnrollmentInfoBox.link')}
              endIcon={<OpenInNewIcon />}
            />
          </Text>
        </div>
      </Collapse>
      <Collapse
        orientation="vertical"
        in={enrollment.hasPreviousEnrollment === true}
      >
        <UploadPreviousEnrollmentAttachment
          attachments={attachments}
          showValidation={showValidation}
          examinerId={examinerId}
        />
      </Collapse>
    </div>
  );
};
