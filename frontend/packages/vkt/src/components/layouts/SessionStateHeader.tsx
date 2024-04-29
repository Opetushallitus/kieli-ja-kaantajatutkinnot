import {
  LogoutOutlined as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Button from '@mui/material/Button';
import { FC } from 'react';
import { Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { useInterval } from 'hooks/useInterval';
import { loadPublicUser } from 'redux/reducers/publicUser';

interface SessionStateHeaderProps {
  firstName: string;
  lastName: string;
}

export const SessionStateHeader: FC<SessionStateHeaderProps> = ({
  firstName,
  lastName,
}) => {
  const dispatch = useAppDispatch();
  const translateCommon = useCommonTranslation();

  const heartBeat = () => {
    if (!document.hidden) {
      dispatch(loadPublicUser());
    }
  };

  useInterval(heartBeat, 5000); // Every 5 seconds

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
