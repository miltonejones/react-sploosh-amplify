import * as React from 'react';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { styled, Box, Menu, MenuItem, IconButton, Divider } from '@mui/material';
import { MoreVert, Close, MenuBook, Shop, VideoLabel } from '@mui/icons-material';
import { getModel } from '../../connector/DbConnector';
import useComponentState from '../../hooks/useComponentState';
import { VideoCard, StyledPagination, Flex, Tabs, Picture, TextBox, FabGroup, TextBoxes } from '../';
import './ModelModal.css';
import { addModelToVideo } from '../../connector/DbConnector';
import { importComplete } from '../ShoppingDrawer/ShoppingDrawer';
import { getModelMissingVideos } from '../../connector/DbConnector';
import { getModelCostars } from '../../connector/DbConnector';
import dynamoStorage from '../../services/DynamoStorage';
import Observer from '../../services/Observer';
import { toggleVideoFavorite } from '../../connector/DbConnector';
import { saveVideo } from '../../connector/DbConnector';
import { getVideoByURL } from '../../connector/ParserConnector';
import { updateModelPhoto } from '../../connector/DbConnector';
import ModelSelect from '../ModelSelect/ModelSelect';
import { addModelAlias } from '../../connector/DbConnector';
import { SplooshContext } from '../../hooks/useSploosh';
import { quickSearch } from '../ShoppingDrawer/ShoppingDrawer';
import { windowChange } from '../../services/WindowManager';
import { useWindowManager } from '../../services/WindowManager';



const StarGrid = styled(Box)({
  display: 'grid',
  lineHeight: 1,
  margin: 24,
  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
  gap: '0.2rem', 
  '& img': {
    width: 76, 
    maxHeight: 100,
    height: 'auto'
  }
});

const StarBox = styled(Box)({
  position: 'relative', 
  width: 76, 
  height: 100,
  overflow: 'hidden',
  cursor: 'pointer',
  '& .caption': {
    cursor: 'pointer',
    position: 'absolute', 
    height: 40,
    width: 76, 
    bottom: -64,
    padding: 4,
    color: 'white', 
    backgroundColor: 'rgba(0,0,0,0.6)',
    transition: 'bottom 0.2s linear'
  },
  '&:hover': {
    outline: 'solid 2px #37a',
    '& .caption': {  
      bottom: 0, 
    },
  }
});

const fixPhoto = src => {
  if (!src) {
    return ''
  }
  if (src.indexOf('//') === 0 && src.indexOf('http') < 0) {
    return `https:${src}`;
  }
  return src;
}

const ModelMenu = ({models, aliases, currentAction, open, anchorEl, onClose, selected, onClick, onAction}) => {
  const handleClose = () => {
    onClose && onClose()
  }
  const actions = [
    {
      label: 'Add Alias'
    },
    {
      label: 'Add Video'
    },
    {
      label: 'Set Photo'
    }
  ]
  return   <Menu  
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
  {models?.map(star => <MenuItem  key={star.ID} disabled={star.ID === selected}
    onClick={() => onClick && onClick(star.ID)}>
      <Avatar sx={{mr: 1}} src={fixPhoto(star.image)} alt={star.name}/>
      {star.name}</MenuItem>)} 

  {!!aliases?.length && <>
    <Divider />
    <Typography ml={1} variant="caption">aliases</Typography>
  </>}

  {aliases?.map(star => <MenuItem key={star.ID}
    onClick={() => onClick && onClick(star.ID)}>
      <Avatar sx={{mr: 1}} src={fixPhoto(star.image)} alt={star.alias}/>
      {star.alias}</MenuItem>)} 

  <Divider />
    <Typography ml={1} variant="caption">actions</Typography>

    {actions.map((action, i) => <MenuItem
      disabled={currentAction === i + 1}
      onClick={() => onAction && onAction(i + 1)}
      key={action.label}  >
      
      {action.label}</MenuItem>)} 


</Menu>
}

const useModelList = () => {  
  const cookieName = 'model-menu-items' 
  const store = dynamoStorage();
  const getModelList = async() => {
    const list = await store.getItem(cookieName);  
    return JSON.parse(list || '[]');
  }
  const setModelList = async(value) => {
    await store.setItem(cookieName, JSON.stringify(value))  
  }
  return {  
    getModelList,
    setModelList 
  }
}

export default function ModelModal(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const menuOpen = Boolean(anchorEl);
  const { state, setState } = useComponentState({ 
    page: 1, 
    tabValue: 0, 
    currentAction: 4,
    response: null  
  });
  const { onClose, selectedId, open, refreshList } = props;
  const { 
    page, 
    response, 
    tabValue = 0, 
    selectedVideos = [], 
    modelList = [], 
    currentId = selectedId,
    filterParam,
    costars = []
  } = state;

  const {
    setState: setSplooshState,  
} = React.useContext(SplooshContext);

  const WindowManager = useWindowManager()
  const [windowLength, setWindowLength] = React.useState(0)
  const {  setModelList, getModelList } = useModelList()
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = async () => {
    onClose(currentId);
    await setModelList([])
  };

  const handleTabs = (m, i) => {
    if (i === 0) {
      loadModel(currentId, 1);
    }
    if (i === 1) {
      loadStars(currentId);
    }
    if (i === 2) {
      loadModel(currentId, 1, !0);
    }
    setState('tabValue', i);
    setState('favorite', i === 2);
  }

  const selectVideo = id => {
    const vids = selectedVideos.indexOf(id) > -1
      ? selectedVideos.filter(f => f !== id)
      : selectedVideos.concat(id)
    setState('selectedVideos', vids);
  }
  
  const castModel = async (index = 0) => {
    if (index < selectedVideos.length) {
      const ID = selectedVideos[index]; 
      const cast = await addModelToVideo(ID, currentId); 
      return await castModel(++index);
    }
    setState('selectedVideos', []);
    importComplete.next();
    handleTabs(null, 0)
    return false;
  }

  const loadMissing = React.useCallback(async (id) => {
    const gone = await getModelMissingVideos(id);
    setState('missingModel', gone);
    setState('loading', 0);
  })

  const loadStars = React.useCallback(async (id) => {
    const stars = await getModelCostars(id);
    setState('costars', stars);
  })

  const reportModel = React.useCallback(async (res) => {
    const { model } = res;
    const star = model[0]
    const existing = await getModelList() 
    const items = existing.filter(f => f.ID !== star.ID).concat(star);
    await setModelList(items);
    setState('modelList', items)
  })

  const loadModel = React.useCallback(async (
    // id of the model
    id, 
    // request page number
    p, 
    // return only favorites
    f,
    // filter param
    s
    ) => { 
    const media = await getModel(id, p, f, s);
    console.log({ media });
    setState('response', media);
    setState('page', p);
    setState('currentId', id);
    setState('tabValue', !!f ? 2 : 0);
    setState('filterParam', s)
    reportModel(media);
    loadMissing(id);
  }, []);

  const handleChange = (event, value) => {
    const { favorite, filterParam } = state;
    loadModel(currentId, value, favorite, filterParam);
  };
  React.useEffect(() => { 
    const sub = modelChange.subscribe(id => {
      loadModel(id, 1)
      setState('tabValue', 0);
    });
    const win = windowChange.subscribe(on => { 
      setWindowLength(WindowManager.getLength())
    })

    return () => {
      win.unsubscribe();
      sub.unsubscribe();
    }
  }, [response, selectedId, currentId, state]);

  if (!response) return <i />;
  const onHeart = async (ID) => {  
    const res = await toggleVideoFavorite(ID);
    loadModel(currentId, page);
    importComplete.next();
  }
  const addVideo = async (uri) => {
    
    const b = await getVideoByURL(uri);
    const c = await saveVideo(b); 
    const d = await addModelToVideo(c, currentId) 
    setState('currentAction', 4);
    setState('boxParam', '')
    loadModel(currentId, 1);
    importComplete.next();
  }
  const { model: star, videos, aliases } = response;
  if (!videos) return 'No videos found for this artist.';
  if (!star?.length) {
    return <>
      Invalid response
      <pre>
        {JSON.stringify(response, 0, 2)}
      </pre>
    </>
  }
  const totalPages = Math.ceil(videos.count / 16);
  const model = star[0];

  let shownCostars = [];
  let paginationProps = {
    totalPages,
    page,
    handleChange
  }
  if (tabValue === 1 && !!costars.length) {
    const pageSize = 28;
    const pageNum = page - 1;
    const startPage = pageNum * pageSize;
    shownCostars = costars.slice(startPage, startPage + pageSize);
    paginationProps = {
      totalPages: Math.ceil(costars.length / pageSize),
      page,
      handleChange:  (event, value) => { 
        setState('page', value)
      }
    }
  } 

  let textProps;
  const propsList = [
    {
      placeholder: 'Enter video URL',
      label: 'Add video',
      sx: {ml: 3, maxWidth: 240}
    },
    {
      placeholder: 'Enter image URL',
      label: 'Set model photo',
      sx: {ml: 3, maxWidth: 240}
    },
    {
      placeholder: 'Filter videos',
      label: 'Search',
      sx: {ml: 3, maxWidth: 240}
    },
  ]

  switch(state.currentAction) {
    case 2:
      textProps = {
        placeholder: 'Enter video URL',
        label: 'Add video', 
        sx: {ml: 3, maxWidth: 240}
      }
      break;
    case 3:
      textProps = {
        placeholder: 'Enter image URL',
        label: 'Set model photo', 
        sx: {ml: 3, maxWidth: 240}
      }
      break;
    default:
      textProps = { 
        placeholder: 'Filter videos',
        label: 'Search',
        sx: {ml: 3, maxWidth: 240}
      }
  }

  const missingLabel = !!state.missingModel?.length ? "Missing" : [];
  const missingTab = !state.missingModel ? "Checking..." : missingLabel;

  const handleCurrentAction = async (v, action) => {
    // video - 0/2
    if (action === 2) {
      await addVideo(v);
      importComplete.next();
      return;
    }

    // image - 1/3
    if (action === 3) {
      await updateModelPhoto(currentId, v);
      setState('currentAction', 4);
      setState('boxParam', '');
      loadModel(currentId, 1);
      importComplete.next();
      return;
    }

    // search - 2
    loadModel(currentId, 1, false, v);
  };

  const checkClipboard = async (b) => {
    const text = await navigator.clipboard.readText(); 
    
    setState('currentAction', b);
    setAnchorEl(null);

    if (!!text) {
      const auto = confirm(`Use "${text}" from clipboard?`);
      if (auto) {
        return handleCurrentAction(text, b)
      }
    }

  }

  const shop = () => {
    setSplooshState('videoDrawerOpen', true);
    setSplooshState('videoDrawerData', model.name);
    setTimeout(() => quickSearch.next(), 999)
    handleClose();
  }
 

  const dialogButtons = [
    {
      icon: <Close />,
      onClick: () => WindowManager.exit()
    },
    {
      icon: <VideoLabel />,
      onClick: () => WindowManager.focus()
    },
    {
      icon:  <Shop />,
      onClick: shop
    }
  ]
 

  return (
    <Dialog
      classes={{ paper: 'model-modal' }}
      onClose={handleClose}
      open={open}
    >
      <DialogTitle sx={{pb: 0, pt: 1, pl: 1, pr: 0}}>
        <Flex mr={2}>
          {!!model.image && <Avatar variant="rounded" onClick={()=>alert( model.ID )} src={fixPhoto(model.image)} alt={model.name} />}
          <Stack ml={2}>
            <Typography variant="body1">{model.name}</Typography>
            <Typography variant="caption">{videos.count} videos </Typography>
          </Stack>


          {state.currentAction === 1 && <ModelSelect sx={{ml: 3}}  onSelect={async (ID) => { 
            await addModelAlias(currentId, ID);
            setState('currentAction', 4);
            setState('boxParam', '');
            loadModel(currentId, 1); 
          }} />}

          {/* search+/image+/video+ text box */}
          {state.currentAction !== 1 && <TextBoxes sx={{ml: 3}} 
            allowClear 
            value={state.boxParam}
            onChange={x => setState('boxParam', x)}
            onEnter={v => handleCurrentAction(v, state.currentAction)}
            selectedIndex={(state.currentAction || 4) - 2}
            textProps={propsList}
            />}

         {state.currentAction !== 4 && <IconButton onClick={() => setState('currentAction', 4)}>
            <Close />
          </IconButton>}
          
          <Box sx={{flexGrow: 1}} />

 

          <IconButton onClick={handleClick}>
            <MoreVert />
          </IconButton>
        </Flex>
     
      <ModelMenu 
        open={menuOpen} 
        models={modelList}
        aliases={aliases}
        selected={currentId}
        currentAction={state.currentAction}
        onAction={checkClipboard}
        onClose={() => setAnchorEl(null)}
        onClick={(v) => { 
          loadModel(v, 1)
          setAnchorEl(null);
        }}
        anchorEl={anchorEl} />
      </DialogTitle>
      <DialogContent sx={{p: 0, m: 0, position: 'relative'}}>
      <Tabs 
        sx={{ml: 1}}
        onChange={handleTabs} 
        value={tabValue} readonly 
        items={['Videos', 'Costars', 'Favorites'].concat(missingTab)} 
        />

        <Flex sx={{pr: 2}}>
          <StyledPagination {...paginationProps}  />
       
          <Box sx={{flexGrow: 1}} />


         {/* {tabValue === 0 && <> 
         <IconButton target="_blank" href={`https://www.google.com/search?q=${model.name}%20xxx&source=lnms&tbm=isch`}>
            <MenuBook />
          </IconButton>

          <IconButton onClick={shop}>
            <Shop />
          </IconButton>
          </>} */}
        </Flex>
     
      {tabValue === 1 && !!shownCostars.length && <StarGrid>
        {shownCostars.map(costar => <StarBox><Picture 
          onClick={() => loadModel(costar.ID, 1)}
          sx={{width: 76, height: 100, backgroundColor: 'tomato', textAlign: 'center'}}
          src={costar.image} alt={costar.name} key={costar.ID} />
          <div onClick={() => loadModel(costar.ID, 1)}className="caption">
            <Typography variant="caption">{costar.name}</Typography>
          </div>
          </StarBox>)}
        </StarGrid>}

      {tabValue === 3 && !!selectedVideos.length && <Button
        sx={{m: 1}}
        onClick={() => castModel()}
        variant="contained"
      >Add {model.name} to {selectedVideos.length} videos</Button>}

      {tabValue === 3 && <div className="ModelVideoGrid">
        {state.missingModel?.map((video) => (
          <VideoCard 
            selected={selectedVideos.some(g => g === video.ID)}
            onClick={v => selectVideo(v.ID)} 
            readonly  
            small 
            key={video.ID} 
            video={video} 
          />
        ))}
      </div>}

      {[0,2].some(i => i === tabValue) && <div className="ModelVideoGrid">
        {videos.records?.map((video) => (
          <VideoCard
            onHeart={onHeart} small key={video.ID} video={video} />
        ))}
      </div>}

      <FabGroup 
        position="absolute"
        mainClick={v =>{
          window.open(`https://www.google.com/search?q=${model.name}%20xxx&source=lnms&tbm=isch`)
        }}
        icon={<MenuBook />}
        buttons={dialogButtons}
      />
      </DialogContent>
    </Dialog>
  );
}

const modelChange = new Observer()

export function useModelModal() {
  const [modelModalState, setState] = React.useState({ open: false });

  const showDialog = (selectedId) => {
    setState({
      open: true,
      selectedId,
      onClose: () => setState({ open: false }),
    });
    modelChange.next(selectedId)
  };

  return { modelModalState, showDialog };
}
