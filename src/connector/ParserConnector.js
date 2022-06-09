
const API_ENDPOINT = 'https://pqapeldcug.execute-api.us-east-1.amazonaws.com';

export const getParsers = async () => {
  const response = await fetch(API_ENDPOINT + `/parsers`);
  return await response.json();
};

export const getParserByDomain = async (domain) => {
  const response = await fetch(API_ENDPOINT + `/parsers/${domain}`);
  return await response.json();
};

export const getVideoByURL = async (uri) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uri }),
  };
  const response = await fetch(API_ENDPOINT + '/', requestOptions);
  return await response.json();
};

export const getVideosByURL = async (uri) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uri }),
  };
  const response = await fetch(API_ENDPOINT + '/search', requestOptions);
  return await response.json();
};

export const getVideosByText = async (domain, param) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain, param }),
  };
  const response = await fetch(API_ENDPOINT + '/search/param', requestOptions);
  return await response.json();
};

export const getVideosBySite = async (domains, param) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domains, param }),
  };
  const response = await fetch(API_ENDPOINT + '/search/site', requestOptions);
  return await response.json();
};

 