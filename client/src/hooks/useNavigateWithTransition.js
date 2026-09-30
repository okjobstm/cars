import { useNavigate } from 'react-router-dom';
import { startTransition } from 'react';

export function useNavigateWithTransition() {
  const navigate = useNavigate();
  
  return (to, options) => {
    startTransition(() => {
      navigate(to, options);
    });
  };
}
