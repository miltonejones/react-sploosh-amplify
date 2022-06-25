import React from 'react'; 
import { Box, IconButton, Typography, Collapse, Stack, Divider, styled } from '@mui/material'; 
import { getDash } from '../../connector/DbConnector';
import { Picture, Flex, Spacer, useModelModal, ModelModal } from '..';
import useSploosh, { SplooshContext } from '../../hooks/useSploosh';
import { importComplete } from '../ShoppingDrawer/ShoppingDrawer';
import { VideoPersistService } from '../../services/VideoPersist';
import { getVideoKeys } from '../../connector/DbConnector';
import VideoCard from '../VideoCard/VideoCard';
import { ExpandMore, Sync } from '@mui/icons-material';
import { ProgressSnackbar } from '../VideoCollection/VideoCollection';
import { toggleVideoFavorite } from '../../connector/DbConnector';
import { getFavorites } from '../../connector/DbConnector';
import { getVideos } from '../../connector/DbConnector';
import { deleteVideo } from '../../connector/DbConnector';


const StarGrid = styled(Box)(({size = 180}) => ({
  display: 'grid',
  lineHeight: 1,
  margin: 4,
  width: 'calc(100vw - 40px)',
  gridTemplateColumns: `repeat(auto-fit, minmax(${size}px, 1fr))`,
  gap: '0.2rem', 
  '& img': {
    width: size - 4, 
    maxHeight: size * 1.4,
    height: 'auto'
  }
}));

const StarItem = styled(Box)(({}) => ({
  position: 'relative' , 
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  '&:hover': {
    outline: 'solid 2px #37a',
    outlineOffset: 4
  },
  '&:active': {
    outline: 'solid 1px #a37',
    outlineOffset: 4
  }
}));

const StarName = styled(Typography)(({}) => ({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bottom: 0,
  height: 32,
  backgroundColor: 'rgba(255,255,255,0.4)' ,
  width: '100%'
}));

const StarCount = styled(Typography)(({}) => ({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  top: 4,
  right: 10,
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: '#37a' ,
  color: '#fff'
}));


const Line = styled(Divider)({
  margin: '8px 0',
  width: '100%'
})


export default function Dash (props) {
  const sploosh = useSploosh(props);
  const [dash, setDash] = React.useState(false);
  const [past, setPast] = React.useState(null);
  const [fave, setFave] = React.useState(null);
  const [list, setList] = React.useState(null);
  const [modelsShown, setShown] = React.useState(false);
  const [recentShown, setRecentShown] = React.useState(false);
  const [snackProps, setSnackProps] = React.useState({value: 0})
  const { modelModalState, showDialog } = useModelModal();


  const refreshLatest = React.useCallback(async () => {
    const items = await getVideos(1);
    setList(items.records)
  }, [])

  const refreshFavorites = React.useCallback(async () => {
    const items = await getFavorites(1);
    setFave(items.records);
    await refreshLatest()
  }, [])

  const refreshRecent = React.useCallback(async () => {
    const videos = await VideoPersistService.get()
    const Keys = videos.slice(0, 40)
    const recent = await getVideoKeys(Keys);
    setPast(recent.records);
    await refreshModels()
  }, [])

  const refreshModels = React.useCallback(async (msg) => {

    if (msg) {
      console.log ({ msg })
      setSnackProps({...msg, open: !sploosh.videoDrawerOpen});
      if (msg.complete) {
        setSnackProps({...msg, open: !1}); 
      }
      return;
    }
    setSnackProps({ open: !1 });


    const data = await getDash();
    setDash(data);

    await refreshFavorites()
  }, [])

  React.useEffect(() => {
    !past && refreshRecent();
    const sub = importComplete.subscribe(refreshRecent);
    return () => sub.unsubscribe();
  }, [dash, past]); 


  return <>
    <Stack sx={{pl: 2, ml: 8, mr: 8, width: 'calc(100vw - 48px)'}}>
 
    <RecentLoader past={past} showDialog={showDialog} /> 
    <Line />

    <ModelLoader dash={dash} showDialog={showDialog}/>
    <Line />

    <RecentLoader title="Latest Added" past={list} showDialog={showDialog} /> 
    <Line />

    <RecentLoader title="Favorites" past={fave} showDialog={showDialog} /> 
    <Line />

    </Stack>

    <ProgressSnackbar {...snackProps} />
    <ModelModal {...modelModalState} />  
  </>
}

const ModelLoader = ({ dash, showDialog }) => {
  const [modelsShown, setShown] = React.useState(false);

  if (!dash)  {
    return <i><Sync className="spin" /> Loading models...</i>
  }

  const cutoff = 6;
  
  const sorted = dash.sort((a,b) => b.FaveCount - a.FaveCount);
  const first = sorted.slice(0, cutoff);
  const rest = sorted.slice(cutoff);
 
  return <>
    <Flex sx={{pr: 4}}>
      <Typography variant="h6">Top Models</Typography>   
      <Spacer />
      <u onClick={() => setShown(!modelsShown)} className="action">Show {modelsShown?'fewer':'more'} top models</u>
      <IconButton className={modelsShown ? "flipped" : ""}><ExpandMore /></IconButton>
    </Flex> 
    <ModelGrid showDialog={showDialog} stars={first} /> 
    
    <Collapse in={modelsShown}>
      <ModelGrid showDialog={showDialog} stars={rest} /> 
    </Collapse>
  </>

}

const RecentLoader = ({ past, showDialog, title = 'Recently Watched Videos' }) => {
  const [recentShown, setRecentShown] = React.useState(false);

  const onDrop  = async (ID, title = "this video") => { 
    const yes = confirm('Are you sure you want to delete ' + title + '?')
    if (!yes) return;  
    const res = await deleteVideo(ID);
    importComplete.next();
  }

  const onHeart = async (ID) => { 
    const res = await toggleVideoFavorite(ID); 
    importComplete.next();
  }

  if (!past)  {
    return <i><Sync className="spin" /> Loading {title}...</i>
  }

  const firstPast = past.slice(0, 5);
  const restPast = past.slice(5);

  return <>
  
  <Flex sx={{pr: 4}}>
      <Typography variant="h6">{title}</Typography> 
      <Spacer />
      <u onClick={() => setRecentShown(!recentShown)} className="action">Show {recentShown?'fewer':'more'} {title.toLowerCase()}</u>
      <IconButton className={recentShown ? "flipped" : ""}><ExpandMore /></IconButton>
    </Flex>  

    <div className="ThumbnailGrid">
      {firstPast.filter(f => !!f && f.ID).map((video) => (
        <VideoCard
          key={video.ID}
          video={video} 
          onDrop={onDrop}
          onHeart={onHeart}
          getModel={(q) => {
            showDialog(q);
          }} 
        />
      ))}
    </div>

    <Collapse in={recentShown}>
      <div className="ThumbnailGrid">
        {restPast.filter(f => !!f && f.ID).map((video) => (
          <VideoCard
            key={video.ID}
            onHeart={onHeart}
            video={video} 
            getModel={(q) => {
              showDialog(q);
            }} 
          />
        ))}
      </div>
    </Collapse>

  </>
}

const ModelGrid = ({stars, showDialog}) => <StarGrid>
{stars.map((d, i) => <StarItem onClick={() => showDialog(d.ID)}>
  <StarName variant="subtitle2">{d.name}</StarName>
  <StarCount variant="caption">{d.FaveCount}</StarCount>
  <img key={i} src={d.image} alt={d.name}/>
  </StarItem>)}
</StarGrid>