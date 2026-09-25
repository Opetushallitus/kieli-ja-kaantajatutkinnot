import { useDispatch, useSelector } from 'react-redux';

import {
  RootState,
  setupStore,
} from 'features/registration/redux/store/indexv2';
export const useAppDispatch =
  useDispatch.withTypes<ReturnType<typeof setupStore>['dispatch']>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const registrationSelector = (state: RootState) => state.registration;
