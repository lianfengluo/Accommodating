import apiRequest from '../apiRequest';
import { BACKEND_PAGESIZE } from "../global.js"

export const GetWishesIdAction = (page, success, error) => {
  const offset = (page - 1) * BACKEND_PAGESIZE;
  apiRequest(`/accommodation/wisheslist/?offset=${offset}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const GetWishesDetailAction = (data, success, error) => {
  apiRequest(`/accommodation/info/list_by_id/`,
    {
      method: "POST",
      payload: data,
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const GetIsWishesAction = (data, success, error) => {
  apiRequest(`/accommodation/wisheslist/${data}/`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const SetWishesAction = (data, success, error) => {
  apiRequest(`/accommodation/wisheslist/`,
    {
      method: "POST",
      payload: data,
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const DeleteWishesAction = (data, success, error) => {
  apiRequest(`/accommodation/wisheslist/${data}/`,
    {
      method: "DELETE",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}