import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import store from 'redux/store/index';

export type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
