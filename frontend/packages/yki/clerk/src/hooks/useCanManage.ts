import { useAppSelector } from 'configs/redux';
import { RouteType } from 'interfaces/user';
import { userSelector } from 'redux/selectors/user';

export const useCanManage = (route: RouteType) => {
  const { user } = useAppSelector(userSelector);

  return route === 'organizer' || !!user?.isAdmin;
};
