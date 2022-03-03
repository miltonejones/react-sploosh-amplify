import React from 'react';
import './style.css';
import useComponentState from './hooks/useComponentState';
import { getVideos, getVideo, findVideos } from './connector/DbConnector';
import {
  VideoCard,
  ModelModal,
  useModelModal,
  Flex,
  StyledPagination,
} from './components';
import { TextField, Box, Button } from '@mui/material';

export default function App() {
  const { state, setState } = useComponentState({ page: 1, response: {} });
  const { modelModalState, showDialog } = useModelModal();
  const { page, response, param } = state;

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
  const searchVideos = React.useCallback(
    async (str, p) => {
      const items = await findVideos(str, p);
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
    <Box>
      <Box className="head">
        <Flex sx={{ textAlign: 'left' }}>
          <TextField
            size="small"
            label="Search"
            placeholder="Enter search params"
            value={param}
            onKeyUp={e => e.keyCode === 13 && searchVideos(param, 1)}
            onChange={(e) => setState('param', e.target.value)}
          />

          <Button onClick={() => searchVideos(param, 1)}>search</Button>
        </Flex>
      </Box>
      <Box className="head">
        <Flex>
          <StyledPagination
            totalPages={totalPages}
            page={page}
            handleChange={handleChange}
          />
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
              onClick={(q) => loadVideo(q.ID)}
            />
          ))}
        </div>
      </Box>

      <Box className="head">
        <Flex>
          <StyledPagination
            totalPages={totalPages}
            page={page}
            handleChange={handleChange}
          />
        </Flex>
      </Box>
      <ModelModal {...modelModalState} />
    </Box>
  );
}
