// Define a generic ServiceResponse type
type ServiceResponse<T> = {
  success: boolean;
  message: string;
  dataObject?: T;
};

const createResponse = <T>(
  success: boolean,
  message: string,
  dataObject?: T
): ServiceResponse<T> => {
  return {
    success,
    message,
    dataObject,
  };
};

const AppError = <T>(message: string, error?: T): ServiceResponse<T> => {
  return createResponse(false, message, error);
};

const AppResponse = <T>(
  success: boolean,
  message: string,
  dataObject?: T
): ServiceResponse<T> => {
  return createResponse(success, message, dataObject);
};

export type { ServiceResponse };
export { AppError, AppResponse };
