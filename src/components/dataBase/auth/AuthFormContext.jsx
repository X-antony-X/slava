import React, { createContext, useContext, useState } from 'react';

const AuthFormContext = createContext();

export const AuthFormProvider = ({ children }) => {
  const [activeForm, setActiveForm] = useState('login');

  return (
    <AuthFormContext.Provider value={{ activeForm, setActiveForm }}>
      {children}
    </AuthFormContext.Provider>
  );
};

export const useAuthForm = () => useContext(AuthFormContext);