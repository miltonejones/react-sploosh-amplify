import React from 'react';

const API_ENDPOINT = 'https://3bax4cg6w7.execute-api.us-east-1.amazonaws.com';

export const getVideos = async (page) => {
  const response = await fetch(API_ENDPOINT + `/video/${page}`);
  return await response.json();
};
