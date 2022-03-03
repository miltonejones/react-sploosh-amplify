import React from 'react';
import './style.css';
import useComponentState from './hooks/useComponentState';
import { getVideos, getVideo } from './connector/DbConnector';
import { VideoCard, ModelModal, useModelModal, Flex } from './components';
import { Pagination, Box } from '@mui/material';

export default function App() {
  const { state, setState } = useComponentState({ page: 1, response: {} });
  const { modelModalState, showDialog } = useModelModal();
  const { page, response } = state;

  const handleChange = (event, value) => {
    loadVideos(value);
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

  const loadVideo = React.useCallback(async (id) => {
    const media = await getVideo(id);
    console.log({ media });
  }, []);

  React.useEffect(() => {
    !response.records && loadVideos(1);
  }, [response]);

  const { count, records } = response;
  if (!records) return 'Loading...';
  const totalPages = Math.ceil(count / 30);

  return (
    <Box className="App">
      <Flex>
        <Pagination
          showFirstButton
          showLastButton
          shape="rounded"
          count={totalPages}
          page={page}
          siblingCount={4}
          onChange={handleChange}
        />
      </Flex>
      <div className="ThumbnailGrid">
        {records?.map((video) => (
          <VideoCard
            key={video.ID}
            video={video}
            getModel={(q) => {
              showDialog(q);
            }}
            onClick={(q) => loadVideo(q.ID)}
          />
        ))}
      </div>
      <Flex>
        <Pagination
          showFirstButton
          showLastButton
          shape="rounded"
          count={totalPages}
          page={page}
          onChange={handleChange}
        />
      </Flex>
      <ModelModal {...modelModalState} />
    </Box>
  );
}
