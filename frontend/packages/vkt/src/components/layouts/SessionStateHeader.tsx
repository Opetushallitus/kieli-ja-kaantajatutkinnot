import {
  LogoutOutlined as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Button from '@mui/material/Button';
import { FC } from 'react';
import { Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';

interface SessionStateHeaderProps {
  firstName: string;
  lastName: string;
}

export const SessionStateHeader: FC<SessionStateHeaderProps> = ({
  firstName,
  lastName,
}) => {
  const translateCommon = useCommonTranslation();

  return (
    <div className="session-header columns gapped">
      <Text className="columns gapped-xxs session-header__user-details">
        <PersonIcon className="session-header__user-icon" />
        {firstName} {lastName}
      </Text>
      <a href={APIEndpoints.PublicAuthLogout}>
        <Button color={Color.Secondary} variant={Variant.Outlined}>
          <LogoutIcon />
          {translateCommon('header.sessionState.logOut')}
        </Button>
      </a>
    </div>
  );
};
