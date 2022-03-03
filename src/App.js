import React from 'react';
import './style.css';
import useComponentState from './hooks/useComponentState';
import { getVideos } from './connector/DbConnector';
import { VideoCard } from './components';
import { Pagination } from '@mui/material';

export default function App() {
  const { state, setState } = useComponentState({ page: 1, response: {} });
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

  React.useEffect(() => {
    !response.videos && loadVideos(1);
  }, [response]);

  const { videos } = response ?? { videos: {} };
  if (!videos) return 'Loading...';
  const { count, records } = videos;
  const totalPages = Math.ceil(count / 30);

  return (
    <>
    <Pagination count={totalPages} page={page} onChange={handleChange} />
      <div className="ThumbnailGrid">
        {records?.map((video) => (
          <VideoCard key={video.ID} video={video} />
        ))}
      </div>
    </>
  );
}
