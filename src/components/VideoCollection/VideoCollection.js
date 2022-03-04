import React from 'react';
import useComponentState from '../../hooks/useComponentState';
import { VideoPersistService } from '../../services/VideoPersist'
import { WindowManagerService } from '../../services/WindowManager';
import { 
  getVideos, 
  getVideo, 
  findVideos, 
  addVideo, 
  getVideoKeys,
  getFavorites,
  toggleVideoFavorite ,
  deleteVideo
} from '../../connector/DbConnector';
import {
  VideoCard,
  ModelModal,
  useModelModal,
  Flex,
  StyledPagination,
  Spacer, 
  SystemDialog, 
  useSystemDialog 
} from '../';
import { TextField, Box, Button, IconButton } from '@mui/material';
import { Sync, Add, VideoLabel } from '@mui/icons-material';
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
    onChange ,
    refreshList,
    systemDialogState, 
    collectionType,
    Prompt,
    onHeart,
    onDrop
  } =
    useVideoCollection(props);
  const { count, records } = response;

  const iconClass = busy ? 'spin' : '';
  if (!records) return 'Loading...';
  const totalPages = Math.ceil(count / 30);

  const add = async () => {
    const URL = await Prompt('Type or paste video URL:', false, 'Add Video')
  
    // const URL = prompt ('Enter video URL');
    if (!URL) return; 
    const id = await addVideo(URL);
    // alert (id + ' was added');
    refreshList();
  } 
  return (
    <Box  className="VideoCollection">
      <Box className="head">
        <Flex sx={{width: '100%'}}> 
          <Box>
            {count} videos
          </Box>
          <StyledPagination
            totalPages={totalPages}
            page={pageNum}
            handleChange={handleChange}
          />
          <Spacer />
          
    {!!WindowManagerService.launched.length &&  
        ( <IconButton onClick={() => WindowManagerService.focus()}>
            <VideoLabel />
          </IconButton>)}
          <IconButton onClick={refreshList}>
            <Sync className={iconClass} />
          </IconButton>
          <IconButton onClick={add}>
            <Add />
          </IconButton>
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
              onHeart={onHeart}
              onDrop={onDrop}
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
      <SystemDialog {...systemDialogState}/>
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
  const { systemDialogState, Prompt, Confirm } = useSystemDialog()
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
    async (p, f) => {
      const items = await getVideos(p);
      const searchKey$ =   `video-${p}`;
      console.log({ items });
      setState('response', { ...items, searchKey: searchKey$ });
      setState('page', p);
      setState('searchKey', searchKey$);
    },
    [page]
  );

  
  const loadFavorites = React.useCallback(
    async (p, f) => {
      const items = await getFavorites(p);
      const searchKey$ =   `heart-${p}`;
      console.log({ items });
      setState('response', { ...items, searchKey: searchKey$ });
      setState('page', p);
      setState('searchKey', searchKey$);
    },
    [page]
  );

  const recentVideos = React.useCallback(
    async (p) => {
      const searchKey$ =  `recent-${p}`;
        const allTracks = VideoPersistService.get()
        const first = (p - 1) * 30;
        const Keys = allTracks.slice(first, first + 30)
        console.log ({p, Keys})
        if (!Keys.length) return alert(['NO KEYS IN', allTracks.length])
        const videos = await getVideoKeys(Keys);
        const items = {
          records: videos.records,
          count: allTracks.length
        }
        setState('response', { ...items , searchKey: searchKey$});
        setState('page', p);
        console.log (videos)
        setState('searchKey', searchKey$);
    }
  )

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
        case 'heart':
          await loadFavorites(p);
          break;
        case 'recent':
          await recentVideos(p);
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
  
  const onHeart = async (ID) => { 
    const res = await toggleVideoFavorite(ID);
    refreshList()
  }

  const onDrop  = async (ID, title="this video") => { 
    const yes = await Confirm('Are you sure you want to delete ' + title + '?')
    if (!yes) return alert ('Well OK then!')
    const res = await deleteVideo(ID);
    refreshList()
  }

  const refreshList = React.useCallback(() => {
    load(page, collectionType, param);
  }, [page, collectionType, param])

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
    onChange,
    refreshList,
    systemDialogState, 
    collectionType,
    Prompt,
    onHeart,
    onDrop
  };
}
