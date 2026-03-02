"use client";
import { createContext, useContext, useState } from "react";
import GlobalLoader from "./GlobalLoader";

const LoaderContext = createContext();

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      <GlobalLoader show={loading} />
      {children}
    </LoaderContext.Provider>
  );
};