import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import {
  OphButton,
  OphInputFormField,
  OphRadioGroupFormField,
} from '@opetushallitus/oph-design-system';
import { useEffect, useRef, useState } from 'react';
import { ComboBox, CustomModal } from 'shared/components';
import {
  APIResponseStatus,
  Color,
  TextFieldVariant,
  Variant,
} from 'shared/enums';
import { ComboBoxOption } from 'shared/interfaces';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamLanguage, ExamLevel, ExamSessionType } from 'enums/app';
import { ClerkExamSession } from 'interfaces/clerkExamSession';
import { ExamDate } from 'interfaces/examDate';
import { H2, Label, Text } from 'ophTheme/Text';
import {
  createExamSession,
  saveExamSession,
} from 'redux/reducers/clerkExamSession';
import { loadOrganizationHierarchy } from 'redux/reducers/clerkOrganizer';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';
import { clerkOrganizersSelector } from 'redux/selectors/clerkOrganizers';
import { DateTimeUtils } from 'utils/dateTime';

type ClerkExamSessionEditModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  examSessionDetails?: ClerkExamSession;
  examDates: ExamDate[];
  mode?: 'create' | 'edit-full' | 'edit-partial';
  organizerOid?: string;
};


// TODO deploy commit

export const ClerkExamSessionEditModal = ({
  isOpen,
  setIsOpen,
  examSessionDetails,
  examDates,
  mode = 'edit-partial',
  organizerOid,
}: ClerkExamSessionEditModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamSessionRegistrations.modals.edit',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const { updateStatus, createStatus } = useAppSelector(
    clerkExamSessionDetailsSelector,
  );
  const { organizationHierarchy } = useAppSelector(clerkOrganizersSelector);

  const isCreateMode = mode === 'create';
  const activeStatus = isCreateMode ? createStatus : updateStatus;
  const location = examSessionDetails?.location[0];
  const isSaving = activeStatus === APIResponseStatus.InProgress;
  const prevActiveStatus = useRef(activeStatus);

  const [selectedOfficeOid, setSelectedOfficeOid] =
    useState<ComboBoxOption | null>(null);

  useEffect(() => {
    if (isOpen && organizerOid) {
      dispatch(loadOrganizationHierarchy(organizerOid));
    }
  }, [isOpen, organizerOid, dispatch]);

  const officeOidOptions: ComboBoxOption[] = organizationHierarchy.map(
    (org) => ({
      label: org.name?.fi ?? org.oid,
      value: org.oid,
    }),
  );

  useEffect(() => {
    if (
      prevActiveStatus.current === APIResponseStatus.InProgress &&
      activeStatus === APIResponseStatus.Success
    ) {
      setIsOpen(false);
    }
    prevActiveStatus.current = activeStatus;
  }, [activeStatus, setIsOpen]);

  const languageOptions = Object.values(ExamLanguage)
    .filter((l) => l !== ExamLanguage.ALL)
    .map((lang) => ({
      value: lang,
      label: translateCommon('languages.' + lang),
    }));

  const levelOptions = [ExamLevel.PERUS, ExamLevel.KESKI, ExamLevel.YLIN].map(
    (level) => ({
      value: level,
      label: translateCommon('languageLevel.' + level),
    }),
  );

  const typeOptions = [
    ExamSessionType.FULL,
    ExamSessionType.READ_SPEAK,
    ExamSessionType.LISTEN_WRITE,
  ].map((type) => ({
    value: type,
    label: t('fields.typeOptions.' + type),
  }));

  const currentExamDateId = examSessionDetails
    ? examDates.find((ed) => ed.examDate.isSame(examSessionDetails.date, 'day'))
        ?.id
    : undefined;

  const [form, setForm] = useState({
    examDateId: String(currentExamDateId ?? ''),
    language: examSessionDetails?.language ?? '',
    level: examSessionDetails?.level ?? '',
    type: examSessionDetails?.type ?? '',
    maxParticipantsTotal: String(
      examSessionDetails?.maxParticipantsTotal ?? '',
    ),
    maxParticipantsPartial1: String(
      examSessionDetails?.maxParticipantsPartial1 ?? '',
    ),
    maxParticipantsPartial2: String(
      examSessionDetails?.maxParticipantsPartial2 ?? '',
    ),
    streetAddress: location?.streetAddress ?? '',
    postalCode: location?.zip ?? '',
    city: location?.postOffice ?? '',
    name:
      organizationHierarchy.find((org) => org.oid === selectedOfficeOid?.value)
        ?.name?.fi ?? '',
    otherLocationInfo: location?.otherLocationInfo ?? '',
    contactName: examSessionDetails?.contactName ?? '',
    contactEmail: examSessionDetails?.contactEmail ?? '',
    contactPhoneNumber: examSessionDetails?.contactPhoneNumber ?? '',
    officeOid: selectedOfficeOid,
  });

  const filteredExamDates = examDates.filter(
    (ed) =>
      (!form.type || ed.examType === form.type) &&
      (!form.language ||
        ed.languages?.some((l) => l.languageCode === form.language)) &&
      (!form.level || ed.languages?.some((l) => l.levelCode === form.level)),
  );

  const examDateOptions = filteredExamDates.map((ed) => {
    const languagesStr =
      ed.languages &&
      ed.languages
        .map(
          (l) =>
            translateCommon('languages.' + l.languageCode) +
            ' - ' +
            translateCommon('languageLevel.' + l.levelCode),
        )
        .join(', ');
    const label = languagesStr
      ? `${DateTimeUtils.renderDate(ed.examDate)} (${languagesStr})`
      : DateTimeUtils.renderDate(ed.examDate);

    return { value: String(ed.id), label };
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleSave = () => {
    if (isCreateMode && organizerOid) {
      dispatch(
        createExamSession({
          ...form,
          organizerOid,
        }),
      );
    } else if (examSessionDetails) {
      dispatch(
        saveExamSession({
          examSessionId: examSessionDetails.id,
          form,
        }),
      );
    }
  };

  return (
    <CustomModal
      open={isOpen}
      onCloseModal={handleCloseModal}
      aria-labelledby="modal-title"
      sx={{ '& .custom-modal': { width: 800 } }}
      modalTitle={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <H2>{isCreateMode ? t('createTitle') : t('title')}</H2>
          <CloseIcon
            color={Color.Inherit}
            aria-hidden={true}
            fontSize="large"
            onClick={handleCloseModal}
          />
        </Box>
      }
    >
      <div className="rows gapped">
        {mode === 'edit-partial' ? (
          <Text>
            {translateCommon('languages.' + form.language)}
            {' - '}
            {translateCommon('languageLevel.' + form.level)}
            {' | '}
            {form.type && t('fields.typeOptions.' + form.type)}
            {' | '}
            {examSessionDetails &&
              DateTimeUtils.renderDate(examSessionDetails.date)}
          </Text>
        ) : (
          <>
            <div className="rows gapped-xxs">
              <Label>{t('officeOidLabel')} *</Label>
              <ComboBox
                data-testid="officeoid-combobox"
                autoHighlight
                variant={TextFieldVariant.Outlined}
                values={officeOidOptions}
                value={selectedOfficeOid}
                onChange={(value?: string) => {
                  const option = officeOidOptions.find(
                    (o) => o.value === value,
                  );
                  setSelectedOfficeOid(option ?? null);
                }}
              />
            </div>

            <OphRadioGroupFormField
              label={t('fields.language')}
              value={form.language}
              onChange={(e) =>
                updateField('language', (e.target as HTMLInputElement).value)
              }
              options={languageOptions}
              disabled={isSaving}
            />
            <OphRadioGroupFormField
              label={t('fields.level')}
              value={form.level}
              onChange={(e) =>
                updateField('level', (e.target as HTMLInputElement).value)
              }
              options={levelOptions}
              disabled={isSaving}
            />
            <OphRadioGroupFormField
              label={t('fields.type')}
              value={form.type}
              onChange={(e) =>
                updateField('type', (e.target as HTMLInputElement).value)
              }
              options={typeOptions}
              disabled={isSaving}
            />
            {examDateOptions.length > 0 ? (
              <OphRadioGroupFormField
                label={t('fields.examDate')}
                value={form.examDateId}
                onChange={(e) =>
                  updateField(
                    'examDateId',
                    (e.target as HTMLInputElement).value,
                  )
                }
                options={examDateOptions}
                disabled={isSaving}
              />
            ) : (
              <div className="rows gapped-xxs">
                <Label>{t('fields.examDate')}</Label>
                <Text>{t('fields.noExamDates')}</Text>
              </div>
            )}
          </>
        )}
        {form.type === ExamSessionType.FULL || !form.type ? (
          <OphInputFormField
            label={t('fields.maxParticipants')}
            value={form.maxParticipantsTotal}
            onChange={(e) =>
              updateField('maxParticipantsTotal', e.target.value)
            }
            type="number"
            disabled={isSaving}
          />
        ) : (
          <div className="columns gapped">
            <OphInputFormField
              label={t('fields.maxParticipantsPart1')}
              value={form.maxParticipantsPartial1}
              onChange={(e) =>
                updateField('maxParticipantsPartial1', e.target.value)
              }
              type="number"
              disabled={isSaving}
            />
            <OphInputFormField
              label={t('fields.maxParticipantsPart2')}
              value={form.maxParticipantsPartial2}
              onChange={(e) =>
                updateField('maxParticipantsPartial2', e.target.value)
              }
              type="number"
              disabled={isSaving}
            />
          </div>
        )}
        <OphInputFormField
          label={t('fields.streetAddress')}
          value={form.streetAddress}
          onChange={(e) => updateField('streetAddress', e.target.value)}
          disabled={isSaving}
        />
        <div className="columns gapped">
          <OphInputFormField
            label={t('fields.postalCode')}
            value={form.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            disabled={isSaving}
          />
          <OphInputFormField
            label={t('fields.city')}
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
            disabled={isSaving}
          />
        </div>
        <OphInputFormField
          label={t('fields.name')}
          value={form.otherLocationInfo}
          onChange={(e) => updateField('otherLocationInfo', e.target.value)}
          disabled={isSaving}
        />
        <OphInputFormField
          label={t('fields.contactName')}
          value={form.contactName}
          onChange={(e) => updateField('contactName', e.target.value)}
          disabled={isSaving}
        />
        <OphInputFormField
          label={t('fields.contactEmail')}
          value={form.contactEmail}
          onChange={(e) => updateField('contactEmail', e.target.value)}
          disabled={isSaving}
        />
        <OphInputFormField
          label={t('fields.contactPhoneNumber')}
          value={form.contactPhoneNumber}
          onChange={(e) => updateField('contactPhoneNumber', e.target.value)}
          disabled={isSaving}
        />
        <div className="columns gapped flex-end">
          <OphButton variant={Variant.Outlined} onClick={handleCloseModal}>
            {translateCommon('cancel')}
          </OphButton>
          <OphButton
            variant={Variant.Contained}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isCreateMode ? t('createButton') : t('saveButton')}
          </OphButton>
        </div>
      </div>
    </CustomModal>
  );
};
