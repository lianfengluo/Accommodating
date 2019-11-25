import apiRequest from '../apiRequest'

export const SubmitUpdateInfo = (data, success, error) => {
  apiRequest("/user/update_info/",
    {
      method: "PUT",
      payload: data,
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}
export const UploadImageAction = (data, success, error) => {
  apiRequest("/user/update_img/",
    {
      method: "PUT",
      payload: data,
      isJSON: false,
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}
