import apiRequest from '../apiRequest'

export const SetLocalStorage = (data) => {
  for (const key in data) {
    localStorage.setItem(key, data[key]);
  }
}

export const RemoveLocalStorage = () => {
  const username = localStorage.getItem("username");
  const remember = localStorage.getItem("remember")
  localStorage.clear();
  if (username && remember) {
    localStorage.setItem("username", username);
  }
}

export const SubmitLogin = (data, success, error) => {
  apiRequest("/user/login",
    {
      method: "POST",
      payload: data,
      isAuthenticated: false,
      onSuccess: success,
      onError: error
    });
}

export const GetUserId = (data, success, error) => {
  apiRequest("/user/info/get_id/",
    {
      method: "POST",
      payload: data,
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const SubmitRegister = (data, success, error) => {
  apiRequest("/user/register",
    {
      method: "POST",
      payload: data,
      isAuthenticated: false,
      onSuccess: success,
      onError: error
    });
}

export const SubmitLogout = (history) => {
  apiRequest("/user/logout",
    {
      isAuthenticated: true,
      onSuccess: () => {
        RemoveLocalStorage();
        window.location.reload();
      },
      onError: () => {
        RemoveLocalStorage();
        window.location.reload();
      },
    });
}

export const GetVerificationCodeExists = (data, success, error) => {
  apiRequest("/user/email_verification_exists",
    {
      method: "POST",
      payload: data,
      isAuthenticated: false,
      onSuccess: success,
      onError: error
    });
}

export const GetVerificationCodeNotExists = (data, success, error) => {
  apiRequest("/user/email_verification_not_exists",
    {
      method: "POST",
      payload: data,
      isAuthenticated: false,
      onSuccess: success,
      onError: error
    });
}

export const ResetPassword = (data, success, error) => {
  apiRequest("/user/email_reset_password",
    {
      method: "POST",
      payload: data,
      isAuthenticated: false,
      onSuccess: success,
      onError: error
    });
}