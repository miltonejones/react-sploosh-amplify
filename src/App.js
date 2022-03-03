import React from 'react';
import './style.css';
import useComponentState from './hooks/useComponentState';
import { getVideos } from './connector/DbConnector';
import { VideoCard } from './components';

export default function App() {
  const { state, setState } = useComponentState({ page: 1 });
  const { page, videos } = state;

  const loadVideos = React.useCallback(async () => {
    const items = await getVideos(page);
    console.log({ items });
    setState('videos', items);
  }, [page]);

  React.useEffect(() => {
    !videos && loadVideos();
  }, [videos]);

  if (videos?.records?.length) {
    return <VideoCard video={videos.records[0]} />;
  }
  return <pre>[{JSON.stringify(videos, 0, 2)}]</pre>;
}
