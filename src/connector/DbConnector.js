import React from 'react';

const API_ENDPOINT = 'https://3bax4cg6w7.execute-api.us-east-1.amazonaws.com';

export const getVideos = async (page) => {
  const response = await fetch(API_ENDPOINT + `/videos/${page}`);
  return await response.json();
};

export const getFavorites = async (page) => {
  const response = await fetch(API_ENDPOINT + `/favorite/${page}`);
  return await response.json();
};

export const getVideo = async (id) => {
  const response = await fetch(API_ENDPOINT + `/video/${id}`);
  return await response.json();
};

export const getModel = async (id, page = 1) => {
  const response = await fetch(API_ENDPOINT + `/model/${id}/${page}`);
  return await response.json();
};

export const findVideos = async (param, page) => {
  const response = await fetch(API_ENDPOINT + `/find/${param}/${page}`);
  return await response.json();
};

export const addVideo = async (URL) => {
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ URL}),
  };
  const response = await fetch(API_ENDPOINT + '/add-video', requestOptions);
  return await response.json();
};

export const getVideoKeys = async (Keys) => {
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Keys}),
  };
  const response = await fetch(API_ENDPOINT + '/video-keys', requestOptions);
  return await response.json();
};