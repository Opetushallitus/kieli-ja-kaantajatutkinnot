import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Container } from '@mui/material';
import { Text, WebLink } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';

export const InformationBox = () => {
  const translateCommon = useCommonTranslation();

  return (
    <Container className="public-homepage__info-box rows gapped">
      <Text>
        <b>{translateCommon('infoBox.part1')}</b>{' '}
        {translateCommon('infoBox.part2')}
      </Text>
      <Text>
        {translateCommon('infoBox.part3')}
        <WebLink
          href={translateCommon('infoBox.url')}
          label={translateCommon('infoBox.link')}
          target="_blank"
          endIcon={<OpenInNewIcon />}
        />
      </Text>
    </Container>
  );
};
