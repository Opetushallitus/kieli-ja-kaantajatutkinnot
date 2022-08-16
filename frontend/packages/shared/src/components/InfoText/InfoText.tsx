import { InfoOutlined as InfoIcon } from '@mui/icons-material';
import { FC, PropsWithChildren } from 'react';

import { Color } from '../../enums/common';
import { Text } from '../Text/Text';
import './InfoText.scss';

export type InfoTextProps = PropsWithChildren;

export const InfoText: FC<InfoTextProps> = ({ children }) => {
  return (
    <div className="info-text columns">
      <InfoIcon className="info-text__icon" color={Color.Secondary} />
      <Text className="info-text__label">{children}</Text>
    </div>
  );
};
