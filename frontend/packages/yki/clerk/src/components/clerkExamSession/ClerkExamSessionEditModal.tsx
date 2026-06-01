import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import {
  OphButton,
  OphInputFormField,
  OphRadioGroupFormField,
} from '@opetushallitus/oph-design-system';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { RouteType } from 'interfaces/user';
import { H2, H3, Label, Text } from 'ophTheme/Text';
import {
  createExamSession,
  createOrganizerExamSession,
  saveExamSession,
  saveOrganizerExamSession,
} from 'redux/reducers/clerkExamSession';
import { loadOrganizationHierarchy } from 'redux/reducers/clerkOrganizer';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';
import { clerkOrganizersSelector } from 'redux/selectors/clerkOrganizers';
import { DateTimeUtils } from 'utils/dateTime';

type ShortLang = 'fi' | 'sv' | 'en';

type ClerkExamSessionEditModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  examSessionDetails?: ClerkExamSession;
  examDates: ExamDate[];
  mode?: 'create' | 'edit-full' | 'edit-partial';
  organizerOid?: string;
  route: RouteType;
  oid?: string;
};

// TODO deploy commit, remove me
export const ClerkExamSessionEditModal = ({
  isOpen,
  setIsOpen,
  examSessionDetails,
  examDates,
  mode = 'edit-partial',
  organizerOid,
  route,
  oid,
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
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({
    officeOid: false,
    language: false,
    level: false,
    type: false,
    examDateId: false,
    maxParticipants: false,
    startTime: false,
    streetAddress: false,
    postalCode: false,
    city: false,
    otherLocationInfo: false,
    contactName: false,
    contactEmail: false,
    contactPhoneNumber: false,
  });

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

  const officeOidToName = (officeOid: string, lang: ShortLang) => {
    return (
      organizationHierarchy.find((org) => org.oid === officeOid)?.name[lang] ??
      ''
    );
  };

  const setOfficeOid = (office: ComboBoxOption | null) => {
    setSelectedOfficeOid(office);
    updateField('officeOid', office?.value ?? '');
    ['fi', 'en', 'sv'].map((lang) => {
      updateLocationField(
        lang as ShortLang,
        'name',
        office ? officeOidToName(office.value, lang as ShortLang) : '',
      );
    });
  };

  const [form, setForm] = useState({
    examDateId: String(currentExamDateId ?? ''),
    language: examSessionDetails?.language ?? '',
    level: examSessionDetails?.level ?? '',
    type: examSessionDetails?.type ?? '',
    maxParticipantsTotal: String(
      examSessionDetails?.maxParticipantsTotal ?? '',
    ),
    maxParticipantsReadListen: String(
      examSessionDetails?.maxParticipantsReadListen ?? '',
    ),
    maxParticipantsSpeakWrite: String(
      examSessionDetails?.maxParticipantsSpeakWrite ?? '',
    ),
    startTime: examSessionDetails?.startTime ?? '',
    startTimeReadListen: examSessionDetails?.startTimeReadListen ?? '',
    startTimeSpeakWrite: examSessionDetails?.startTimeSpeakWrite ?? '',
    location: (['fi', 'sv', 'en'] as const).map((lang) => {
      const loc = examSessionDetails?.location.find((l) => l.lang === lang);

      return {
        lang,
        streetAddress: loc?.streetAddress ?? location?.streetAddress ?? '',
        postalCode: loc?.zip ?? location?.zip ?? '',
        city: loc?.postOffice ?? location?.postOffice ?? '',
        name: '',
        otherLocationInfo:
          loc?.otherLocationInfo ?? location?.otherLocationInfo ?? '',
        extraInformation: loc?.extraInformation ?? '',
      };
    }),
    contactName: examSessionDetails?.contactName ?? '',
    contactEmail: examSessionDetails?.contactEmail ?? '',
    contactPhoneNumber: examSessionDetails?.contactPhoneNumber ?? '',
    officeOid: examSessionDetails?.officeOid ?? '',
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

  const updateLocationField = (
    lang: ShortLang,
    field: string,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      location: prev.location.map((loc) =>
        // Extra information is language specific. All other fields are have same value for every lang
        field === 'extraInformation'
          ? loc.lang === lang
            ? { ...loc, [field]: value }
            : loc
          : { ...loc, [field]: value },
      ),
    }));
  };

  const validate = useCallback(() => {
    const loc = form.location[0];
    const isFull = form.type === ExamSessionType.FULL || !form.type;

    return {
      officeOid: mode !== 'edit-partial' && !selectedOfficeOid,
      language: !form.language,
      level: !form.level,
      type: !form.type,
      examDateId: mode !== 'edit-partial' && !form.examDateId,
      maxParticipants: isFull
        ? !form.maxParticipantsTotal
        : !form.maxParticipantsReadListen || !form.maxParticipantsSpeakWrite,
      startTime: isFull
        ? !form.startTime
        : !form.startTimeReadListen || !form.startTimeSpeakWrite,
      streetAddress: !loc?.streetAddress,
      postalCode: !loc?.postalCode,
      city: !loc?.city,
      otherLocationInfo: !loc?.otherLocationInfo,
      contactName: !form.contactName,
      contactEmail: !form.contactEmail,
      contactPhoneNumber: !form.contactPhoneNumber,
    };
  }, [form, selectedOfficeOid, mode]);

  useEffect(() => {
    if (submitted) {
      const current = validate();

      setErrors((prev) => ({
        officeOid: prev.officeOid && current.officeOid,
        language: prev.language && current.language,
        level: prev.level && current.level,
        type: prev.type && current.type,
        examDateId: prev.examDateId && current.examDateId,
        maxParticipants: prev.maxParticipants && current.maxParticipants,
        startTime: prev.startTime && current.startTime,
        streetAddress: prev.streetAddress && current.streetAddress,
        postalCode: prev.postalCode && current.postalCode,
        city: prev.city && current.city,
        otherLocationInfo: prev.otherLocationInfo && current.otherLocationInfo,
        contactName: prev.contactName && current.contactName,
        contactEmail: prev.contactEmail && current.contactEmail,
        contactPhoneNumber:
          prev.contactPhoneNumber && current.contactPhoneNumber,
      }));
    }
  }, [submitted, validate]);

  const handleCloseModal = () => {
    setSubmitted(false);
    setIsOpen(false);
  };

  const handleSave = () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setSubmitted(true);

    if (Object.values(validationErrors).some(Boolean)) {
      return;
    }

    if (isCreateMode && organizerOid) {
      dispatch(
        route === 'clerk'
          ? createExamSession({
              ...form,
              organizerOid,
            })
          : createOrganizerExamSession({
              ...form,
              organizerOid,
            }),
      );
    } else if (examSessionDetails) {
      dispatch(
        route === 'clerk'
          ? saveExamSession({
              examSessionId: examSessionDetails.id,
              form,
            })
          : saveOrganizerExamSession({
              examSessionId: examSessionDetails.id,
              form,
              oid: oid ?? '',
            }),
      );
    }
  };

  const translatePartialExamTypeReadListen = () =>
    examSessionDetails?.type === ExamSessionType.READ_SPEAK ? 'Read' : 'Listen';

  const translatePartialExamTypeSpeakWrite = () =>
    examSessionDetails?.type === ExamSessionType.READ_SPEAK ? 'Speak' : 'Write';

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
                  setOfficeOid(option ?? null);
                }}
                showError={submitted && errors.officeOid}
                helperText={
                  submitted && errors.officeOid
                    ? t('errors.required')
                    : undefined
                }
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
              error={submitted && errors.language}
              helperText={
                submitted && errors.language ? t('errors.required') : undefined
              }
            />
            <OphRadioGroupFormField
              label={t('fields.level')}
              value={form.level}
              onChange={(e) =>
                updateField('level', (e.target as HTMLInputElement).value)
              }
              options={levelOptions}
              disabled={isSaving}
              error={submitted && errors.level}
              helperText={
                submitted && errors.level ? t('errors.required') : undefined
              }
            />
            <OphRadioGroupFormField
              label={t('fields.type')}
              value={form.type}
              onChange={(e) =>
                updateField('type', (e.target as HTMLInputElement).value)
              }
              options={typeOptions}
              disabled={isSaving}
              error={submitted && errors.type}
              helperText={
                submitted && errors.type ? t('errors.required') : undefined
              }
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
                error={submitted && errors.examDateId}
                helperText={
                  submitted && errors.examDateId
                    ? t('errors.required')
                    : undefined
                }
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
          <div className="columns gapped">
            <OphInputFormField
              label={t('fields.maxParticipants')}
              value={form.maxParticipantsTotal}
              onChange={(e) =>
                updateField('maxParticipantsTotal', e.target.value)
              }
              type="number"
              disabled={isSaving}
              error={submitted && errors.maxParticipants}
              helperText={
                submitted && errors.maxParticipants
                  ? t('errors.required')
                  : undefined
              }
            />
            <OphInputFormField
              label={t('fields.startTime')}
              value={form.startTime}
              onChange={(e) => updateField('startTime', e.target.value)}
              type="time"
              disabled={isSaving}
              error={submitted && errors.startTime}
              helperText={
                submitted && errors.startTime ? t('errors.required') : undefined
              }
            />
          </div>
        ) : (
          <>
            <div className="grid-2-columns gapped">
              <OphInputFormField
                label={t(
                  'fields.maxParticipants' +
                    translatePartialExamTypeReadListen(),
                )}
                value={form.maxParticipantsReadListen}
                onChange={(e) =>
                  updateField('maxParticipantsReadListen', e.target.value)
                }
                type="number"
                disabled={isSaving}
                error={submitted && errors.maxParticipants}
                helperText={
                  submitted && errors.maxParticipants
                    ? t('errors.required')
                    : undefined
                }
              />
              <OphInputFormField
                label={t(
                  'fields.startTime' + translatePartialExamTypeReadListen(),
                )}
                value={form.startTimeReadListen}
                onChange={(e) =>
                  updateField('startTimeReadListen', e.target.value)
                }
                type="time"
                disabled={isSaving}
                error={submitted && errors.startTime}
                helperText={
                  submitted && errors.startTime
                    ? t('errors.required')
                    : undefined
                }
              />
            </div>
            <div className="grid-2-columns gapped">
              <OphInputFormField
                label={t(
                  'fields.maxParticipants' +
                    translatePartialExamTypeSpeakWrite(),
                )}
                value={form.maxParticipantsSpeakWrite}
                onChange={(e) =>
                  updateField('maxParticipantsSpeakWrite', e.target.value)
                }
                type="number"
                disabled={isSaving}
                error={submitted && errors.maxParticipants}
                helperText={
                  submitted && errors.maxParticipants
                    ? t('errors.required')
                    : undefined
                }
              />
              <OphInputFormField
                label={t(
                  'fields.startTime' + translatePartialExamTypeSpeakWrite(),
                )}
                value={form.startTimeSpeakWrite}
                onChange={(e) =>
                  updateField('startTimeSpeakWrite', e.target.value)
                }
                type="time"
                disabled={isSaving}
                error={submitted && errors.startTime}
                helperText={
                  submitted && errors.startTime
                    ? t('errors.required')
                    : undefined
                }
              />
            </div>
          </>
        )}
        <OphInputFormField
          label={t('fields.streetAddress')}
          value={form.location[0]?.streetAddress ?? ''}
          onChange={(e) =>
            updateLocationField('fi', 'streetAddress', e.target.value)
          }
          disabled={isSaving}
          error={submitted && errors.streetAddress}
          helperText={
            submitted && errors.streetAddress ? t('errors.required') : undefined
          }
        />
        <div className="columns gapped">
          <OphInputFormField
            label={t('fields.postalCode')}
            value={form.location[0]?.postalCode ?? ''}
            onChange={(e) =>
              updateLocationField('fi', 'postalCode', e.target.value)
            }
            disabled={isSaving}
            error={submitted && errors.postalCode}
            helperText={
              submitted && errors.postalCode ? t('errors.required') : undefined
            }
          />
          <OphInputFormField
            label={t('fields.city')}
            value={form.location[0]?.city ?? ''}
            onChange={(e) => updateLocationField('fi', 'city', e.target.value)}
            disabled={isSaving}
            error={submitted && errors.city}
            helperText={
              submitted && errors.city ? t('errors.required') : undefined
            }
          />
        </div>
        <OphInputFormField
          label={t('fields.name')}
          value={form.location[0]?.otherLocationInfo ?? ''}
          onChange={(e) =>
            updateLocationField('fi', 'otherLocationInfo', e.target.value)
          }
          disabled={isSaving}
          error={submitted && errors.otherLocationInfo}
          helperText={
            submitted && errors.otherLocationInfo
              ? t('errors.required')
              : undefined
          }
        />
        <H3>{t('contactHeading')}</H3>
        <OphInputFormField
          label={t('fields.contactName')}
          value={form.contactName}
          onChange={(e) => updateField('contactName', e.target.value)}
          disabled={isSaving}
          error={submitted && errors.contactName}
          helperText={
            submitted && errors.contactName ? t('errors.required') : undefined
          }
        />
        <OphInputFormField
          label={t('fields.contactEmail')}
          value={form.contactEmail}
          onChange={(e) => updateField('contactEmail', e.target.value)}
          disabled={isSaving}
          error={submitted && errors.contactEmail}
          helperText={
            submitted && errors.contactEmail ? t('errors.required') : undefined
          }
        />
        <OphInputFormField
          label={t('fields.contactPhoneNumber')}
          value={form.contactPhoneNumber}
          onChange={(e) => updateField('contactPhoneNumber', e.target.value)}
          disabled={isSaving}
          error={submitted && errors.contactPhoneNumber}
          helperText={
            submitted && errors.contactPhoneNumber
              ? t('errors.required')
              : undefined
          }
        />
        <H3>{t('extraInformationHeading')}</H3>
        <OphInputFormField
          label={t('fields.extraInformationFi')}
          value={
            form.location.find((l) => l.lang === 'fi')?.extraInformation ?? ''
          }
          onChange={(e) =>
            updateLocationField('fi', 'extraInformation', e.target.value)
          }
          multiline
          minRows={2}
          disabled={isSaving}
        />
        <OphInputFormField
          label={t('fields.extraInformationSv')}
          value={
            form.location.find((l) => l.lang === 'sv')?.extraInformation ?? ''
          }
          onChange={(e) =>
            updateLocationField('sv', 'extraInformation', e.target.value)
          }
          multiline
          minRows={2}
          disabled={isSaving}
        />
        <OphInputFormField
          label={t('fields.extraInformationEn')}
          value={
            form.location.find((l) => l.lang === 'en')?.extraInformation ?? ''
          }
          onChange={(e) =>
            updateLocationField('en', 'extraInformation', e.target.value)
          }
          multiline
          minRows={2}
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
