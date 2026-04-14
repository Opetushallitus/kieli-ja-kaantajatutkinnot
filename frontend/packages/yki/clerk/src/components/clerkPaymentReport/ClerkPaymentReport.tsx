import { CircularProgress, Typography } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { CustomDatePicker } from 'shared/components';
import { Severity, Variant } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { usePublicTranslation } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';

export const ClerkPaymentReport = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkPaymentReport',
  });
  const { showToast } = useToast();

  const [from, setFrom] = useState<Dayjs | null>(
    dayjs().subtract(1, 'month').startOf('month'),
  );
  const [to, setTo] = useState<Dayjs | null>(
    dayjs().subtract(1, 'month').endOf('month'),
  );
  const [loading, setLoading] = useState(false);

  const isValid = from && to && !to.isBefore(from, 'day');

  const handleDownload = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const url = `${APIEndpoints.ClerkPaymentReportExcel}?from=${from.format(
        'YYYY-MM-DD',
      )}&to=${to.format('YYYY-MM-DD')}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
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
      a.download = `YKI_tutkintomaksut_${from.format('YYYY-MM-DD')}_${to.format(
        'YYYY-MM-DD',
      )}.xlsx`;
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
      <Typography variant="h3">{t('title')}</Typography>
      <Typography>{t('description')}</Typography>
      <div className="columns gapped" style={{ alignItems: 'flex-end' }}>
        <div className="rows gapped-xxs">
          <label>{t('from')}</label>
          <div style={{ maxWidth: '180px' }}>
            <CustomDatePicker value={from} setValue={setFrom} />
          </div>
        </div>
        <Typography style={{ paddingBottom: '8px' }}>—</Typography>
        <div className="rows gapped-xxs">
          <label>{t('to')}</label>
          <div style={{ maxWidth: '180px' }}>
            <CustomDatePicker value={to} setValue={setTo} />
          </div>
        </div>
      </div>
      <div>
        <OphButton
          color="primary"
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
