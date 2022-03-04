import React from 'react';
import useComponentState from '../../hooks/useComponentState';
import { getVideos, getVideo, findVideos } from '../../connector/DbConnector';
import {
  VideoCard,
  ModelModal,
  useModelModal,
  Flex,
  StyledPagination,
} from '../';
import { TextField, Box, Button } from '@mui/material';
import './VideoCollection.css';

export default function VideoCollection(props) {
  const { 
    setBusy, 
    response, 
    pageNum, 
    handleChange, 
    modelModalState, 
    showDialog, 
    busy, 
    searchParam, 
    searchKey,
    onChange 
  } =
    useVideoCollection(props);
  const { count, records } = response;
  if (!records) return 'Loading...';
  const totalPages = Math.ceil(count / 30);
  return (
    <Box  className="VideoCollection">
      <Box className="head">
        <Flex>
          {/* [{pageNum}][[{searchParam}]][{searchKey}][{response.searchKey}] */}
          <StyledPagination
            totalPages={totalPages}
            page={pageNum}
            handleChange={handleChange}
          />
          {!!busy && <em>loading...</em>}
        </Flex>
      </Box>
      <Box className="App">
        <div className="ThumbnailGrid">
          {records?.map((video) => (
            <VideoCard
              key={video.ID}
              video={video}
              getModel={(q) => {
                showDialog(q);
              }}
              onSearch={onChange}
            />
          ))}
        </div>
      </Box>
      <Box className="head">
        <Flex>
          <StyledPagination
            totalPages={totalPages}
            page={pageNum}
            handleChange={handleChange}
          />
        </Flex>
      </Box>
      <ModelModal {...modelModalState} />
    </Box>
  );
}

function useVideoCollection({
  collectionType,
  searchParam,
  pageNum,
  onChange,
  setBusy,
  navigate
}) {
  const { state, setState } = useComponentState({
    page: 1,
    param: searchParam,
    type: collectionType,
    response: {},
    searchKey: `${collectionType}-${searchParam}-${pageNum}`
  });
  const { modelModalState, showDialog } = useModelModal();
  const { page, response, busy, type, param, searchKey, loaded } = state;
  
  const createKey = React.useCallback(
    () => [collectionType,searchParam,pageNum].filter(f => !!f).join('-'),
      [collectionType,searchParam,pageNum]);

  const handleChange = (event, value) => {
    const prefix = !searchParam ? '' : `/${searchParam}`
    const href = `/${collectionType}${prefix}/${value}`
    navigate && navigate(href);
  };
  const loadVideos = React.useCallback(
    async (p) => {
      const items = await getVideos(p);
      const searchKey$ =   `video-${p}`;
      console.log({ items });
      setState('response', { ...items, searchKey: searchKey$ });
      setState('page', p);
      setState('searchKey', searchKey$);
    },
    [page]
  );

  const searchVideos = React.useCallback(
    async (str, p) => {
      const items = await findVideos(str, p);
      const searchKey$ =  `search-${str}-${p}`;
      console.log({ items });
      setState('response', { ...items , searchKey: searchKey$});
      setState('page', p);
      setState('param', str);
      setState('searchKey', searchKey$);
    },
    [page]
  );

  const load = React.useCallback(
    async (p, t, s) => {
      setState('busy', !0);
      setBusy(!0);
      switch (collectionType) {
        case 'search':
          console.log ('searching for ', s, searchParam, p)
          await searchVideos(s || searchParam, p);
          break;
        default:
          await loadVideos(p);
      }
      setState('type', t);
      setState('busy', !1);
      setBusy(!1);
    },
    [collectionType]
  );

  React.useEffect(() => {
    if (busy) return;
    if (loaded) return;
    const renew = searchKey !== createKey();
    console.log({pageNum, page, param, searchParam, searchKey}, 
            [createKey(), response.searchKey, renew.toString()]);
    (!!renew || !response.records) && load(pageNum, collectionType, searchParam);
  }, [response, busy, pageNum, page, collectionType, type, param, searchParam]);

  // const { count, records } = response;
  // if (!records) return 'Loading...';
  // const totalPages = Math.ceil(count / 30);
  return {
    response,
    searchParam,
    pageNum,
    handleChange,
    modelModalState,
    showDialog,
    busy,
    setBusy,
    searchKey,
    onChange
  };
}
