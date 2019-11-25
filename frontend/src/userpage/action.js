import apiRequest from '../apiRequest'

export const FetchUserInfo = (user, success, error) => {
  apiRequest(`/user/info/${user}/`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const FectchPropertyInfo = (user, success, error) => {
  apiRequest(`/accommodation/info/user/?owner=${user}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}