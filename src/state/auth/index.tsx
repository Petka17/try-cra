import React from "react";
import { codeRequest, loginWithCode } from "api/auth";

import { initialState, reducer, PHONE_LENGTH, CODE_LENGTH } from "./state";

import {
  SetPhone,
  StartCodeRequest,
  CodeRequestSuccess,
  CodeRequestFail,
  SetCode,
  StartLoginWithCode,
  LoginWithCodeSuccess,
  LoginWithCodeFail
} from "./action";

/**
 * Context for React Component
 */
interface Context {
  phone: string;
  setPhone: (phone: string) => void;
  canStartCodeRequest: boolean;
  startCodeRequest: () => void;
  errorMessage: string;
  codeInputFlag: boolean;
  code: string;
  setCode: (code: string) => void;
  isLoading: boolean;
}

const defaultAuth: Context = {
  phone: initialState.phone,
  setPhone: /* istanbul ignore next */ () => {},
  canStartCodeRequest: false,
  startCodeRequest: /* istanbul ignore next */ () => {},
  errorMessage: initialState.errorMessage,
  codeInputFlag: initialState.codeInputFlag,
  code: initialState.code,
  setCode: /* istanbul ignore next */ () => {},
  isLoading: initialState.isLoading
};

const ContextFactory = React.createContext<Context>(defaultAuth);

/**
 * Provider
 */
export function Provider({
  children
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [
    { phone, isLoading, errorMessage, codeInputFlag, code },
    dispatch
  ] = React.useReducer(reducer, initialState);

  const setPhone = (phone: string): void => dispatch(new SetPhone(phone));

  const canStartCodeRequest = phone.length === PHONE_LENGTH && !isLoading;

  const startCodeRequest = (): void => {
    dispatch(new StartCodeRequest());

    codeRequest(phone)
      .then((resp: string) => {
        dispatch(new CodeRequestSuccess(resp));
      })
      .catch((err: Error) => {
        dispatch(new CodeRequestFail(err.message));
      });
  };

  const setCode = (code: string): void => {
    dispatch(new SetCode(code));
  };

  React.useEffect(() => {
    if (code.length === CODE_LENGTH) {
      dispatch(new StartLoginWithCode());

      loginWithCode(phone, code)
        .then(() => {
          dispatch(new LoginWithCodeSuccess());
        })
        .catch((err: Error) => {
          dispatch(new LoginWithCodeFail(err.message));
        });
    }
  }, [code]);

  const context: Context = {
    phone,
    setPhone,
    canStartCodeRequest,
    startCodeRequest,
    errorMessage,
    codeInputFlag,
    code,
    setCode,
    isLoading
  };

  return (
    <ContextFactory.Provider value={context}>
      {children}
    </ContextFactory.Provider>
  );
}

export const getContext = (): Context => React.useContext(ContextFactory);
