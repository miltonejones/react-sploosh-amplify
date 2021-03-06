import React from 'react';
import useComponentState from '../../hooks/useComponentState';
import { VideoPersistService } from '../../services/VideoPersist'
import   { SplooshContext }  from '../../hooks/useSploosh';
import { useWindowManager, windowChange } from '../../services/WindowManager';
import { 
  getVideos, 
  getVideo, 
  findVideos, 
  addVideo, 
  getVideoKeys,
  getFavorites,
  toggleVideoFavorite ,
  deleteVideo,
  getPhoto
} from '../../connector/DbConnector';
import {
  VideoCard,
  ModelModal, 
  Flex,
  FabGroup,
  StyledPagination,
  Spacer, 
  SystemDialog, 
  useSystemDialog ,
  PhotoModal, 
  usePhotoModal
} from '../';
import { TextField, Box, Button, IconButton, Badge, Snackbar,
  Stack,
  Alert,
  Typography, 
  LinearProgress,
  styled
} from '@mui/material';
import { Sync, Add, VideoLabel, Close, Edit, CheckBox } from '@mui/icons-material';
import './VideoCollection.css';
import VideoDrawer from '../VideoDrawer/VideoDrawer';
import { importComplete } from '../ShoppingDrawer/ShoppingDrawer';
import { quickSearch } from '../ShoppingDrawer/ShoppingDrawer';
import { getVideosByDomain } from '../../connector/DbConnector';
import { getModelsByTitle } from '../../connector/DbConnector';
import { updateModelPhoto } from '../../connector/DbConnector';



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
    closeVideoPanel,
    openVideoPanel,
    selectVideo,
    selectedVideos,
    candidateVideos,
    toggleEditMode,
    editMode,
    onHeart,
    onDrop,
    openSearchPanel,
    videoDrawerOpen,
    openShoppingCart
  } = useVideoCollection(props);
  const WindowManager = useWindowManager()
  const { count, records } = response;
  const [windowLength, setWindowLength] = React.useState(0)
  const [snackProps, setSnackProps] = React.useState({value: 0});
  const modal = usePhotoModal();
  React.useEffect(() => {
    const sub = windowChange.subscribe(on => {
      console.log ({ sub }); 
      setWindowLength(WindowManager.getLength())
    })

    const im =  importComplete.subscribe((data) => {
      if (data) {
        console.log ({ data })
        setSnackProps({...data, open: !videoDrawerOpen});
        if (data.complete) {
          setSnackProps({...data, open: !1});
          return openShoppingCart()
        }
        return;
      }
      setSnackProps({ open: !1 });
      refreshList()
    });

    return () => {
      sub.unsubscribe();
      im.unsubscribe();
    }
  })

  const iconClass = busy ? 'spin' : '';
  if (!records) return 'Loading...' + collectionType;
  const totalPages = Math.ceil(count / 30);


  const add = async () => {

    const insert = async (t) => {
      
      const id = await addVideo(t);
      refreshList();
    }
    
    const text = await navigator.clipboard.readText(); 
    if (!!text) {
      const auto = confirm(`Use "${text}" from clipboard?`);
      if (auto) {
        return await insert(text)
      }
    }

 
    const URL = await Prompt('Type or paste video URL:', '', 'Add Video')
  
    // const URL = prompt ('Enter video URL');
    if (!URL) return; 
    await insert(URL); 
  } 
  const windowButtons = [
    {
      icon: <Close />,
      onClick: () => WindowManager.exit()
    },
    {
      icon: <VideoLabel />,
      onClick: () => WindowManager.focus()
    }
  ]

  const onModel = async(video) => {
   refreshList()
  }

  const EditIcon = !!editMode
    ? <Badge color="primary" badgeContent={candidateVideos?.length}><CheckBox className={iconClass} /></Badge>
    : <Edit className={iconClass} />
  const editButtons = [
    {
      icon:  EditIcon,
      onClick: () => {
        if (candidateVideos?.length) {
          openVideoPanel()
          return;
        }
        toggleEditMode()
      }
    },
    {
      icon:  <Sync className={iconClass} />,
      onClick: refreshList
    }
  ]

  const fabButtons = (!!windowLength ? windowButtons : []).concat(editButtons);

  const findPhoto = async (star) => {
    const photo = await getPhoto(star.Name);
    if (photo.src) {
      const ok = await modal.showPhoto(photo);
      if (ok) { 
        await updateModelPhoto(star.ID, ok);
        refreshList && refreshList()
      }
      return;
    } 
    alert (JSON.stringify(photo))
  }

  return (
    <>
    <Box  className="VideoCollection">
      <Box className="head">
        <Flex sx={{width: '100%'}}> 
          <Box sx={{whiteSpace: 'nowrap'}}>
            {count} videos 
          </Box>
          <StyledPagination
            totalPages={totalPages}
            page={pageNum}
            handleChange={handleChange}
          />
          <Spacer />
 
        </Flex>
      </Box>
      <Box sx={{mt:1}} className="App">
        <div className="ThumbnailGrid">
          {records?.filter(f => !!f && f.ID).map((video) => (
            <VideoCard
              key={video.ID}
              video={video}
              onClick={selectVideo}
              onShop={openSearchPanel}
              selected={!!selectedVideos?.length && selectedVideos.some(f => !!f && f.ID === video.ID)}
              chosen={!!candidateVideos?.length && candidateVideos.some(f => !!f && f.ID === video.ID)}
              getModel={(q) => {
                showDialog(q);
              }}
              onPhoto={findPhoto}
              onModel={onModel}
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
      <SystemDialog {...systemDialogState}/>
    </Box>
      <FabGroup 
        mainClick={add}
        icon={<Add />}
        buttons={fabButtons}
      />
      <PhotoModal {...modal.photoModalState} />
      <VideoDrawer onClose={closeVideoPanel} refreshList={refreshList}  />
      <ProgressSnackbar {...snackProps} />
    </>
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


  const {
    modelModalState, 
    showDialog, 
    candidateVideos,
    selectedVideos, 
    selectVideo, 
    editMode,
    searches,
    videoDrawerOpen,
    setState: setComponentState
} = React.useContext(SplooshContext);
 
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

  const handleClick = (video) => {
     const existing = selectedVideos || [];
     const updated = existing.some(f => f.ID === video.ID)
      ? existing.filter(f => f.ID !== video.ID)
      : existing.concat(video)
  };

  
  const loadVideos = React.useCallback(
    async (p, f) => {
      const items = await getVideos(p);
      const searchKey$ =   `video-${p}`;
      console.log({ items });
      setState('response', { ...items, searchKey: searchKey$ });
      setState('page', p);
      setState('searchKey', searchKey$);
      refreshSelectedVideos(items);
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
      refreshSelectedVideos(items);
    },
    [page]
  );

  const recentVideos = React.useCallback(
    async (p) => {
      const searchKey$ =  `recent-${p}`;
        const allTracks = await VideoPersistService.get()
        const first = (p - 1) * 30;
        const Keys = allTracks.slice(first, first + 30)
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
        refreshSelectedVideos(items);
    }
  )
 

  const searchVideos = React.useCallback(
    async (str, p, d) => {
      let items;
      const selectedTab = searches.find(f => f.param === str);
      const { records } = selectedTab ?? [];

      console.log ({ selectedTab })

      if (!!records?.length) {
        items = records
      } else {
        const method = !!d ? getVideosByDomain : findVideos;
        items = await method(str, p);
      }



      const key = !d ? 'search' : 'domain';
      const searchKey$ =  `${key}-${str}-${p}`;


      console.log({ items });
      setState('response', { ...items , searchKey: searchKey$});
      setState('page', p);
      setState('param', str);
      setState('searchKey', searchKey$);
      refreshSelectedVideos(items);

      if (!selectedTab)  return;

      const tab = {
        ...selectedTab,
        ...items,
        page: p,
      };

      setComponentState('searches', searches.map(p => {
        if (p.param === str) return tab;
        return p;
      }))

    },
    [page]
  );

  const refreshSelectedVideos = (res) => {
    const { records } = res;
    
    console.log ({ records, selectedVideos });

    const createdKey = createKey();
    const updated = selectedVideos.map(f => records.find(e => e.ID === f.ID));
    setComponentState('selectedVideos', updated)
    setComponentState('candidateVideos', [])
    setComponentState('editMode', false)
    setState(createdKey, res)
  }

  const toggleEditMode = () => { 
    setComponentState('editMode', !editMode)
  }

  const openShoppingCart = () => {
    setComponentState('videoDrawerOpen', true)
  }

  const load = React.useCallback(
    async (p, t, s) => {
      setState('busy', !0);
      setBusy(!0); 
      switch (collectionType) {
        case 'search': 
        case 'domain':
          console.log ('searching for ', s, searchParam, p)
          await searchVideos(s || searchParam, p, collectionType === 'domain');
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
    if (!yes) return; // alert ('Well OK then!')
    const res = await deleteVideo(ID);
    refreshList()
  }

  const refreshList = React.useCallback(() => {
    load(page, collectionType, param);
  }, [page, collectionType, param])

  React.useEffect(() => {
    if (busy) return;
    if (loaded) return; 
    const createdKey = createKey();
    const renew = searchKey !== createdKey;// || !response.records;
    
    if (state[createdKey]) {
      // setState('response', { ...state[createdKey] , searchKey: createdKey});
      // setState('page', 1); 
      // setState('searchKey', createdKey);
      // refreshSelectedVideos(state[createdKey])
      return console.log({exists: createdKey, records: state[createdKey]});
    }
    
    console.log({
      pageNum, 
      renew,
      page, 
      param, 
      searchParam, 
      searchKey,
      createdKey,
      busy,
      loaded,
      response
    });

    !!renew && load(pageNum, collectionType, searchParam);

  }, [response, busy, pageNum, page, collectionType, type, param, searchParam]);

  const closeVideoPanel = () => {
    setComponentState('candidateVideos', []);
    setComponentState('editMode', false);
    setComponentState('selectedVideos', []);
  }

  const openSearchPanel = (param) => {
    setComponentState('videoDrawerOpen', true);
    setComponentState('videoDrawerData', param);
    setTimeout(() => quickSearch.next(), 999)
  }

  const openVideoPanel = () => { 
    setComponentState('selectedVideos', candidateVideos)
  }

  // const { count, records } = response;
  // if (!records) return 'Loading...';
  // const totalPages = Math.ceil(count / 30);
  return {
    closeVideoPanel,
    openVideoPanel,
    response,
    searchParam,
    pageNum,
    handleChange,
    modelModalState,
    openSearchPanel,
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
    onDrop,
    selectVideo,
    toggleEditMode,
    editMode,
    candidateVideos,
    selectedVideos,
    videoDrawerOpen,
    openShoppingCart
  };
}

export const ProgressSnackbar = ({progress = 0, statusText, video, image, open}) => { 
  const photo = video?.image || image;
  return <Snackbar
  anchorOrigin={{ vertical:'bottom', horizontal:'left' }}
  open={open}>
    <Block severity="info" sx={{minWidth: '30vw', overflow: 'hidden'}}>
      <Flex style={{'--block-offset': !!photo ? '72px' : '172px'}}>
        {!!photo && <img src={photo} alt={video?.title} 
          style={{width: 100, height: 'auto', borderRadius: 4}}/>}
        <Stack sx={{ ml:1 }}>
          <Text variant="caption">{statusText}</Text>
          {!!progress && <LinearProgress variant="determinate" value={progress} />}
        </Stack>
      </Flex>
    </Block>

  </Snackbar>
}

const Block = styled(Box)(() => ({
  backgroundColor: '#dadaff',
  padding: 8  ,
  borderRadius: 4
}))

const Text = styled(Typography)(() => ({
  width: 'calc(30vw - var(--block-offset))',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',  
}))

