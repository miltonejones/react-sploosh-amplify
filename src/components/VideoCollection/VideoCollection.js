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

export default function VideoCollection(props) {
  const { response, pageNum, handleChange, modelModalState, showDialog, busy } =
    useVideoCollection(props);
  const { count, records } = response;
  if (!records) return 'Loading...';
  const totalPages = Math.ceil(count / 30);
  return (
    <>
      <Box className="head">
        <Flex>
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
    </>
  );
}

function useVideoCollection({
  collectionType,
  searchParam,
  pageNum,
  onChange,
}) {
  const { state, setState } = useComponentState({
    page: 1,
    type: collectionType,
    response: {},
  });
  const { modelModalState, showDialog } = useModelModal();
  const { page, response, busy, type } = state;

  const handleChange = (event, value) => {
    onChange && onChange(value);
  };
  const loadVideos = React.useCallback(
    async (p) => {
      const items = await getVideos(p);
      console.log({ items });
      setState('response', items);
      setState('page', p);
    },
    [page]
  );

  const searchVideos = React.useCallback(
    async (str, p) => {
      const items = await findVideos(str, p);
      console.log({ items });
      setState('response', items);
      setState('page', p);
    },
    [page]
  );

  const load = React.useCallback(
    async (p, t) => {
      setState('busy', !0);
      switch (collectionType) {
        case 'search':
          await searchVideos(searchParam, p);
          break;
        default:
          await loadVideos(p);
      }
      setState('type', t);
      setState('busy', !1);
    },
    [collectionType]
  );

  React.useEffect(() => {
    const renew = pageNum !== page || collectionType !== type;
    console.log([pageNum, page, renew.toString()]);
    (!!renew || !response.records) && load(pageNum, collectionType);
  }, [response, pageNum, page, collectionType, type]);

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
  };
}
