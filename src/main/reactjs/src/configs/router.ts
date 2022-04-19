import { useNavigate, useLocation } from 'react-router-dom';

export const useAppNavigate = useNavigate;
export const useQuery = () => new URLSearchParams(useLocation().search);
