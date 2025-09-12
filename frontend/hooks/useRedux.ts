import { useContext } from 'react';
import type { RootState, AppDispatch } from '../app/store';

// Note: This is a placeholder implementation
// In a real app, you would need to install react-redux and use:
// import { useDispatch, useSelector } from 'react-redux';
// export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector(selector);

// For now, these are placeholder hooks that need react-redux to be properly implemented
export const useAppDispatch = (): AppDispatch => {
  throw new Error('react-redux not installed. Install react-redux to use Redux hooks.');
};

export const useAppSelector = <T>(selector: (state: RootState) => T): T => {
  throw new Error('react-redux not installed. Install react-redux to use Redux hooks.');
};
