import { CircularProgress, Divider, Typography } from '@mui/material';
import {
  OphButton,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import dayjs from 'dayjs';
import { SyntheticEvent, useEffect, useMemo, useState } from 'react';
import {
  CustomDatePicker,
  LabeledMultipleCheckboxDropdown,
} from 'shared/components';
import {
  APIResponseStatus,
  Severity,
  TextFieldVariant,
  Variant,
} from 'shared/enums';
import { useToast } from 'shared/hooks';
import { ComboBoxOption } from 'shared/interfaces';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIEndpoints, APIError } from 'enums/api';
import { ClerkStatisticsFilterState } from 'interfaces/clerkStatistics';
import { loadClerkOrganizerRegistry } from 'redux/reducers/clerkOrganizer';
import { clerkOrganizersSelector } from 'redux/selectors/clerkOrganizers';
import { LANGUAGES, levelDescription } from 'utils/clerk';
import { SerializationUtils } from 'utils/serialization';

type LevelCode = 'PERUS' | 'KESKI' | 'YLIN';

const LEVELS: LevelCode[] = ['PERUS', 'KESKI', 'YLIN'];

const defaultStart = dayjs().startOf('month').subtract(1, 'year');

const emptyFilters: ClerkStatisticsFilterState = {
  startDate: null,
  endDate: null,
  languages: [],
  levels: [],
  organizers: [],
  municipality: '',
};

const initialFilters: ClerkStatisticsFilterState = {
  ...emptyFilters,
  startDate: defaultStart,
  endDate: dayjs(),
};

export const ClerkStatisticsFilter = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkStatistics',
  });
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const { organizerRegistry, organizerRegistryStatus } = useAppSelector(
    clerkOrganizersSelector,
  );

  const [filters, setFilters] =
    useState<ClerkStatisticsFilterState>(initialFilters);
  const [loading, setLoading] = useState(false);

  const updateFilter = <K extends keyof ClerkStatisticsFilterState>(
    key: K,
    value: ClerkStatisticsFilterState[K],
  ) => setFilters((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (organizerRegistryStatus === APIResponseStatus.NotStarted) {
      dispatch(loadClerkOrganizerRegistry());
    }
  }, [dispatch, organizerRegistryStatus]);

  const isValid =
    filters.startDate &&
    filters.endDate &&
    !filters.endDate.isBefore(filters.startDate, 'day');

  const organizerOptions = useMemo(
    () =>
      organizerRegistry
        .map((entry) => ({
          label: entry.organization?.nimi?.fi ?? '',
          value: entry.organizer.oid,
        }))
        .filter((option) => option.label)
        .sort((a, b) => a.label.localeCompare(b.label)),
    [organizerRegistry],
  );

  const languageOptions = useMemo(
    () => LANGUAGES.map((lang) => ({ label: lang.name, value: lang.code })),
    [],
  );

  const levelOptions = useMemo(
    () => LEVELS.map((l) => ({ label: levelDescription(l), value: l })),
    [],
  );

  const handleClear = () => setFilters(emptyFilters);

  const handleDownload = async () => {
    const { startDate, endDate } = filters;
    if (!startDate || !endDate || endDate.isBefore(startDate, 'day')) return;

    setLoading(true);
    try {
      const params = SerializationUtils.serializeClerkStatisticsExportParams({
        from: startDate.format('YYYY-MM-DD'),
        to: endDate.format('YYYY-MM-DD'),
        languages: filters.languages.map(({ value }) => value),
        levels: filters.levels.map(({ value }) => value),
        organizers: filters.organizers.map(({ value }) => value),
        municipality: filters.municipality,
      });

      const url = `${APIEndpoints.ClerkStatisticsExcel}?${params.toString()}`;
      const response = await fetch(url, {
        credentials: 'include',
        redirect: 'manual',
      });
      if (!response.ok) {
        const errorCode = await response
          .json()
          .then((data) => data?.errorCode as string | undefined)
          .catch(() => undefined);

        if (errorCode === APIError.StatisticsEmptyResult) {
          showToast({
            severity: Severity.Info,
            description: t('toasts.emptyResult'),
          });

          return;
        }

        showToast({
          severity: Severity.Error,
          description: t('toasts.downloadError'),
        });

        return;
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `YKI_tilastot_${startDate.format(
        'YYYY-MM-DD',
      )}_${endDate.format('YYYY-MM-DD')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rows gapped">
      <Typography>{t('description')}</Typography>

      <div className="rows gapped-xxs">
        <Typography fontWeight="bold">{t('fields.dateRange')}</Typography>
        <div className="columns gapped-xxs">
          <div style={{ width: '180px' }} data-testid="statistics-start-date">
            <CustomDatePicker
              value={filters.startDate}
              setValue={(value) => updateFilter('startDate', value)}
            />
          </div>
          <Typography>—</Typography>
          <div style={{ width: '180px' }} data-testid="statistics-end-date">
            <CustomDatePicker
              value={filters.endDate}
              setValue={(value) => updateFilter('endDate', value)}
            />
          </div>
        </div>
      </div>

      <Divider />

      <LabeledMultipleCheckboxDropdown
        id="statistics-filter-language"
        label={t('fields.language')}
        variant={TextFieldVariant.Outlined}
        values={languageOptions}
        value={filters.languages}
        onChange={(_: SyntheticEvent, newValue: ComboBoxOption[]) =>
          updateFilter('languages', newValue)
        }
      />

      <LabeledMultipleCheckboxDropdown
        id="statistics-filter-level"
        label={t('fields.level')}
        variant={TextFieldVariant.Outlined}
        values={levelOptions}
        value={filters.levels}
        onChange={(_: SyntheticEvent, newValue: ComboBoxOption[]) =>
          updateFilter('levels', newValue)
        }
      />

      <LabeledMultipleCheckboxDropdown
        id="statistics-filter-organizer"
        label={t('fields.organizer')}
        variant={TextFieldVariant.Outlined}
        values={organizerOptions}
        value={filters.organizers}
        onChange={(_: SyntheticEvent, newValue: ComboBoxOption[]) =>
          updateFilter('organizers', newValue)
        }
      />

      <OphInputFormField
        label={t('fields.municipality')}
        value={filters.municipality}
        onChange={(e) => updateFilter('municipality', e.target.value)}
      />

      <Divider />

      <div className="columns gapped flex-end">
        <OphButton variant={Variant.Outlined} onClick={handleClear}>
          {t('clearFilters')}
        </OphButton>
        <OphButton
          variant={Variant.Contained}
          disabled={!isValid || loading}
          onClick={handleDownload}
        >
          {loading && (
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
          )}
          {t('download')}
        </OphButton>
      </div>
    </div>
  );
};
