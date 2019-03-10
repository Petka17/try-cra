import axios, { AxiosResponse, AxiosError } from "axios";
import * as _ from "jsonous";

import { makeRequest } from "../utils";

jest.mock("axios");

const mockedAxios: jest.Mock = axios as jest.Mocked<any>;

afterEach(() => {
  mockedAxios.mockClear();
});

const createAxiosResponse = (
  data: any = {},
  status: number = 200,
  statusText: string = "OK"
): AxiosResponse => ({
  status,
  statusText,
  data,
  headers: {},
  config: {}
});

const createAxiosError = (response: AxiosResponse): AxiosError => ({
  name: "",
  message: "",
  config: {},
  response
});

const makeRequestErrorCheck = async (
  msg: string | RegExp,
  fail: (error: string) => void
): Promise<void> => {
  await makeRequest("/", "post", {}, _.string)
    .then(() => {
      fail("It should fail");
    })
    .catch(e => {
      if (typeof msg === "string") {
        expect(e.message).toBe(msg);
      } else {
        expect(e.message).toEqual(expect.stringMatching(msg));
      }
    });
};

/**
 * Reject with correct message
 * statusText: "Error on the server",
 * {
 *    "success": false,
 *    "message": "Something went wrong"
 * }
 */
test("Reject with correct message", async done => {
  const message = "Something went wrong";
  const statusText = "Error on the server";

  mockedAxios.mockResolvedValueOnce(
    Promise.reject(
      createAxiosError(
        createAxiosResponse({ success: false, message }, 500, statusText)
      )
    )
  );
  await makeRequestErrorCheck(message, done.fail);

  done();
});

/**
 * Reject with no message
 * statusTest: "Error on the server",
 * {
 *    "success": false
 * }
 */
test("Reject with no message", async done => {
  const statusText = "Error on the server";

  mockedAxios.mockResolvedValueOnce(
    Promise.reject(
      createAxiosError(createAxiosResponse({ success: false }, 500, statusText))
    )
  );
  await makeRequestErrorCheck(statusText, done.fail);

  done();
});

/**
 * Reject with incorrect server data format
 * statusTest: "Error on the server",
 * {
 *    "success": true
 * } |
 * {
 *    "success": "false"
 * } |
 * {
 *    "success": false,
 *    "message": 123
 * }
 */
test("Reject with incorrect server data format", async done => {
  const statusText = "Error on the server";

  mockedAxios.mockResolvedValueOnce(
    Promise.reject(
      createAxiosError(
        createAxiosResponse({ success: "false" }, 500, statusText)
      )
    )
  );
  await makeRequestErrorCheck(statusText, done.fail);

  mockedAxios.mockResolvedValueOnce(
    Promise.reject(
      createAxiosError(createAxiosResponse({ success: true }, 500, statusText))
    )
  );
  await makeRequestErrorCheck(statusText, done.fail);

  mockedAxios.mockResolvedValueOnce(
    Promise.reject(
      createAxiosError(
        createAxiosResponse({ success: false, message: 123 }, 500, statusText)
      )
    )
  );
  await makeRequestErrorCheck(statusText, done.fail);

  done();
});

/**
 * Reject with no response
 */
test("Reject with no response", async done => {
  const unknownError = "Unknown server error";

  mockedAxios.mockResolvedValueOnce(Promise.reject({}));
  await makeRequestErrorCheck(unknownError, done.fail);

  done();
});

/**
 * Resolve with correct data
 * {
 *    "success": true,
 *    "data": {
 *      "field": "value"
 *    }
 * }
 */
test("Resolve with correct data", async done => {
  const field = "value";

  mockedAxios.mockResolvedValue(
    Promise.resolve(createAxiosResponse({ success: true, data: { field } }))
  );

  await makeRequest("/", "post", {}, _.field("field", _.string))
    .then(result => {
      expect(result).toBe(field);
    })
    .catch(e => {
      done.fail(`makeRequest failed with error: ${e}`);
    });

  done();
});

/**
 * Resolve with null data and it is expected
 * {
 *    "success": true
 * }
 */
test("Resolve with null data and it is expected", async done => {
  mockedAxios.mockResolvedValue(
    Promise.resolve(createAxiosResponse({ success: true }))
  );

  await makeRequest("/", "post", {})
    .then(() => {
      expect(true).toBe(true);
    })
    .catch(e => {
      done.fail(`makeRequest failed with error: ${e}`);
    });

  done();
});

/**
 * Resolve with data which is not comply with decoder
 * {
 *    "success": true,
 *    "data": {
 *      "field": "value"
 *    }
 * }
 */
test("Resolve with data which is not comply with decoder", async done => {
  const field = "value";

  mockedAxios.mockResolvedValue(
    Promise.resolve(createAxiosResponse({ success: true, data: { field } }))
  );

  await makeRequestErrorCheck(/expected to find a string/, done.fail);

  done();
});

/**
 * Resolve with null data and it is not expected
 * {
 *    "success": true
 * }
 */
test("Resolve with null data and it is not expected", async done => {
  mockedAxios.mockResolvedValue(
    Promise.resolve(createAxiosResponse({ success: true }))
  );

  await makeRequestErrorCheck(/expected to find a string/, done.fail);

  done();
});

/**
 * Resolve with incorrect server data format
 * {
 *    "success": true
 * } |
 * {
 *    "success": "true"
 * }
 */
test("Resolve with incorrect server data format", async done => {
  mockedAxios.mockResolvedValue(
    Promise.resolve(createAxiosResponse({ success: false }))
  );

  await makeRequestErrorCheck(/expected true value/, done.fail);

  mockedAxios.mockResolvedValue(
    Promise.resolve(createAxiosResponse({ success: "true" }))
  );

  await makeRequestErrorCheck(/expected true value/, done.fail);

  done();
});
