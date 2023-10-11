import { Box } from '@mui/material';
import { H1 } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';

export const LoadingFallback = () => {
  const translateCommon = useCommonTranslation();

  return (
    <Box>
      <H1>{translateCommon('loadingContent')}</H1>
    </Box>
  );
};
