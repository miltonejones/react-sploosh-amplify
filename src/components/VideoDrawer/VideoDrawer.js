import React from 'react';
import { 
  Box,
  Card, 
  Avatar,
  AvatarGroup,
  CardContent, 
  CardActionArea,
  Tooltip,
  Divider,
  Button,
  IconButton,
  Typography,
  CardMedia 
} from '@mui/material';
import { styled, Drawer } from '@mui/material';
import   { SplooshContext }  from '../../hooks/useSploosh';

import { Add, Delete, MenuBook, Launch } from '@mui/icons-material';

import { 
  SystemDialog, 
  useSystemDialog ,
  UL,
  LI,
  Flex,
  Spacer
} from '../';
import ModelSelect from '../ModelSelect/ModelSelect';
import { addModelToVideo } from '../../connector/DbConnector';
import { removeModelFromVideo } from '../../connector/DbConnector';
import { addModel } from '../../connector/DbConnector';
import { deleteVideo } from '../../connector/DbConnector';
import { getModelsByTitle } from '../../connector/DbConnector';

const Line = styled(Divider)({
  margin: '8px 0'
})


export default function VideoDrawer ({refreshList, onClose, onClick}) {
  const { systemDialogState, Prompt, Confirm } = useSystemDialog();
  const [foundModels, setFoundModels] = React.useState([])
  const {
    selectedVideos
  } = React.useContext(SplooshContext); 

  React.useEffect(() => {
    if (!selectedVideos.length) return;
    (async() => {
      const firstVid = selectedVideos[0];
      const found = await getModelsByTitle(firstVid.title);  
      setFoundModels(found?.filter(f => {
        return !firstVid.models.length || !firstVid.models.some(m => m.ID === f.ID);
      }));
    })();
  }, [selectedVideos])

  const drawerOpen = !!selectedVideos?.length;
  if (!selectedVideos.length) return <i/>

  const imageVideo = selectedVideos.find(f => !!f.models?.length)
  const videoOne = imageVideo || selectedVideos[0];
  const videoRest = selectedVideos.slice(1);

  const castModel = async (id, index = 0) => {
    if (index < selectedVideos.length) {
      const video = selectedVideos[index]; 
      if (videoOne.ID !== video.ID || !videoRest.length)  { 
        const cast = await addModelToVideo(video.ID, id); 
      }
      return await castModel(id, ++index);
    }
    refreshList && refreshList()
    return false;
  }

  const createModel = async (name) => {
    const added = await addModel(name);
    if (!added) return alert ('Insert failed!');
    const { insertId } = added;
     await castModel(insertId);
  }


  const castModels = async (modelItems, index = 0) => {
    if (index < modelItems.length) {
      const model = modelItems[index];  
      const cast = await castModel(model.ID);
      return await castModels(modelItems, ++index);
    } 
  }


  const multiModel = async (modelList, index = 0) => {
    if (index < modelList.length) {
      const ID = modelList[index];  
      const cast = await castModel(ID);
      return await multiModel(modelList, ++index);
    } 
  }

  const multiDrop = async () => {
    const ok = await Confirm(`Delete ${selectedVideos.length} videos?`);
    if (!ok) return; 
    execDrop()
  }

  const execDrop = async (index = 0) => {
    if (index < selectedVideos.length) {
      const video = selectedVideos[index];  
      const cast = await deleteVideo(video.ID);
      return await execDrop(++index);
    } 
    refreshList && refreshList()
  }


  const dropModel = async (id) => {
    const cast = await removeModelFromVideo(videoOne.ID, id);
    refreshList && refreshList()
  }
  
  return <>
      <Drawer
        classes={{ root: 'maxWidth', paper: 'maxWidth' }}
        anchor="left"
        open={drawerOpen}
        onClose={onClose}
        >
          <Flex sx={{pl: 1}}>
            <Box>
            Edit Video
            </Box> 
            <Spacer />
            <IconButton href={videoOne.URL} target="_blank">
              <Launch  /> 
            </IconButton>

           {!!videoOne.Key && <IconButton    
              href={`https://www.javlibrary.com/en/vl_searchbyid.php?keyword=${videoOne.Key}`} target="_blank"
              ><MenuBook /></IconButton>}
          </Flex>
          
          
          <Divider />


          <Box sx={{p: 1}}>


          <Card sx={{maxWidth: 320}} elevation={1}>
            <CardActionArea>
              <Tooltip title={videoOne.title}>
                  <CardMedia
                  component="img"
                  width={300}
                  image={videoOne.image}
                  alt={videoOne.title} 
                />
              </Tooltip>
            </CardActionArea>
          </Card>

          <Typography variant="body2" sx={{mt: 1, mb: 1}}>{videoOne.title}</Typography>
          <Line />

          {!!videoRest.length && <>
          <Flex>

           
              {videoRest.slice(0, 3).map(av => <Avatar sx={{mr:1}} variant="rounded" src={av.image} alt={av.title} key={av.ID} />)}

              {videoRest.length > 3 && <small>+ {selectedVideos.length - 3} more</small>}
           
          </Flex>
            <Line />
          </>}

 

         {!!videoOne.models?.length && <>
          <Typography variant="caption" sx={{mb: 1}}>STARRING</Typography>
            <UL>
            {videoOne.models?.map((star, i) => <ModelItem key={i} star={star} onClick={dropModel}/>)}
            </UL>
            <Line />
         </>}


         <ModelSelect onMultiple={multiModel} onSelect={castModel} onCreate={createModel} />

         {!!foundModels?.length && <>
          <Typography variant="caption" sx={{mb: 1}}>ALSO STARRING</Typography>
            <UL>
            {foundModels?.map((star, i) => <ModelItem key={i} star={star}/>)}
            </UL>
            <Line />
            <Button onClick={() => castModels(foundModels)} fullWidth variant="contained"
            >Add {foundModels.length} <Plural amt={foundModels.length}>model</Plural> to {selectedVideos.length} <Plural amt={selectedVideos.length}>video</Plural></Button>
         </>}

     
        
         
          {!!videoRest.length && !!videoOne.models?.length && <Button onClick={() => castModels(videoOne.models)} fullWidth variant="contained"
            >Add {videoOne.models.length} <Plural amt={videoOne.models.length}>model</Plural> to {selectedVideos.length} <Plural amt={selectedVideos.length}>video</Plural></Button>}

          {!!videoRest.length &&  <Button sx={{mt: 1}} onClick={() => multiDrop()} fullWidth color="error" variant="contained"
            >Delete {selectedVideos.length} videos</Button>}

          </Box>

          {/* <pre>{JSON.stringify(selectedVideos,0,2)}</pre> */}
        </Drawer>
        <SystemDialog {...systemDialogState}/>
  </>
}

const Plural = ({children, amt}) => {
  const s = amt === 1 ? '' : 's';
  return <>{children}{s}</>
}

const ModelItem = ({star, onClick}) => {
  const name = star.Name || star.name;
  return <LI dense>

  <Avatar size="small" sx={{mr: 1}} variant="rounded" src={star.image} alt={name} >{name?.substr(0,1)}</Avatar>
  
  <Typography variant="body2"  >{name}</Typography>
  
  
  {!!onClick && <Box className="menubox">
    <Delete onClick={() => onClick(star.ID)} />
  </Box>}
  
  </LI>
}