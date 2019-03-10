import React from "react";
import { fireEvent, render, wait } from "react-testing-library";

import SigninPage from "../Signin";
import { codeRequest, loginWithCode } from "../../api/auth";

jest.mock("../../api/auth", () => {
  return {
    codeRequest: jest.fn(
      () =>
        new Promise(resolve => {
          const timer = setTimeout(() => {
            clearTimeout(timer);
            resolve("auth_token");
          }, 100);
        })
    ),
    loginWithCode: jest.fn(
      () =>
        new Promise(resolve => {
          let wait = setTimeout(() => {
            clearTimeout(wait);
            resolve("auth_token");
          }, 100);
        })
    )
  };
});

const mockCodeRequest: jest.Mock = codeRequest as jest.Mock;
const mockLoginWithCode: jest.Mock = loginWithCode as jest.Mock;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const renderPage = (phone = "") => {
  const utils = render(<SigninPage />);
  const phoneInput = utils.getByLabelText(/Телефон/) as HTMLInputElement;
  const requestCodeButton = utils.getByText(
    /Запросить код/
  ) as HTMLButtonElement;

  const fillPhone = (phone: string): void => {
    fireEvent.change(phoneInput, { target: { value: phone } });
  };

  if (phone !== "") fillPhone(phone);

  return {
    ...utils,
    fillPhone,
    phoneInput,
    requestCodeButton
  };
};

afterEach(() => {
  mockCodeRequest.mockClear();
});

test("Signin page should have phone input and submit button, and input should be focused", () => {
  const { phoneInput, requestCodeButton } = renderPage();

  expect(phoneInput).toHaveAttribute("type", "tel");
  expect(phoneInput).toHaveFocus(); // not working properly
  expect(requestCodeButton).toBeDisabled();
});

test("Signin page input should clear all non number character, apply formatting and not allow more than 11 numbers", () => {
  const { phoneInput, fillPhone } = renderPage();

  const phone = "75551*2f34)567er234";
  const clearedPhone = "75551234567";

  fillPhone(phone);

  expect(phoneInput.value).toBe(clearedPhone);
});

test("Signin page submit button should become enabled only if user fill correct phone", () => {
  const { requestCodeButton, fillPhone } = renderPage();

  expect(requestCodeButton).toBeDisabled();
  fillPhone("7555111223");
  expect(requestCodeButton).toBeDisabled();
  fillPhone("75551112233");
  expect(requestCodeButton).toBeEnabled();
  fillPhone("75551112");
  expect(requestCodeButton).toBeDisabled();
  fillPhone("75551112233");
  expect(requestCodeButton).toBeEnabled();
});

test("When submit button is clicked, code request should fire and button should become disabled", async () => {
  const phone = "75551112233";
  const { requestCodeButton, getByLabelText } = renderPage(phone);

  expect(requestCodeButton).toBeEnabled();

  fireEvent.click(requestCodeButton);

  expect(mockCodeRequest).toHaveBeenCalledTimes(1);
  expect(mockCodeRequest).toHaveBeenCalledWith(phone);

  expect(requestCodeButton).toBeDisabled();

  await wait(() => expect(getByLabelText(/Код/)).toBeInTheDocument(), {
    timeout: 150
  });
});

test("If there are any errors in requesting code, the should be shown under the input", async () => {
  const error = new Error("error");
  const { requestCodeButton, getByText, queryByText } = renderPage(
    "75551112233"
  );

  mockCodeRequest.mockReturnValueOnce(Promise.reject(error));
  fireEvent.click(requestCodeButton);
  await wait(() => expect(getByText(error.message)).toBeInTheDocument(), {
    timeout: 150
  });

  expect(requestCodeButton).toBeEnabled();

  fireEvent.click(requestCodeButton);
  expect(queryByText(error.message)).toBeNull();
});

test("When submit button is clicked and code request fire and code input should be editable", async () => {
  const phone = "75551112233";
  const code = "12jkn24332";
  const clearCode = "1224";
  const correctCode = "1234";
  const error = new Error("Incorrect code");

  const {
    requestCodeButton,
    getByLabelText,
    getByText,
    queryByText
  } = renderPage(phone);

  fireEvent.click(requestCodeButton);

  await wait(() => expect(getByLabelText(/Код/)).toBeInTheDocument(), {
    timeout: 150
  });

  const codeInput = getByLabelText(/Код/) as HTMLInputElement;

  mockLoginWithCode.mockReturnValueOnce(Promise.reject(error));
  fireEvent.change(codeInput, { target: { value: code } });

  expect(codeInput.value).toBe(clearCode);
  expect(mockLoginWithCode).toHaveBeenCalledTimes(1);
  expect(mockLoginWithCode).toHaveBeenCalledWith(phone, clearCode);

  await wait(() => expect(getByText(error.message)).toBeInTheDocument(), {
    timeout: 100
  });

  mockLoginWithCode.mockClear();

  fireEvent.change(codeInput, { target: { value: "" } });
  fireEvent.change(codeInput, { target: { value: correctCode } });

  expect(mockLoginWithCode).toHaveBeenCalledTimes(1);
  expect(mockLoginWithCode).toHaveBeenCalledWith(phone, correctCode);

  await wait(() => expect(codeInput).toBeDisabled(), { timeout: 50 });
  await wait(
    () => {
      expect(queryByText(error.message)).toBeNull();
      expect(codeInput).toBeEnabled();
    },
    {
      timeout: 150
    }
  );
});
