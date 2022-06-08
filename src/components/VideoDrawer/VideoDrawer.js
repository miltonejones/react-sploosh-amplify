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

import { Add, Delete, MenuBook } from '@mui/icons-material';

import { 
  SystemDialog, 
  useSystemDialog ,
  UL,
  LI,
  Flex
} from '../';
import ModelSelect from '../ModelSelect/ModelSelect';
import { addModelToVideo } from '../../connector/DbConnector';
import { removeModelFromVideo } from '../../connector/DbConnector';
import { addModel } from '../../connector/DbConnector';

const Line = styled(Divider)({
  margin: '8px 0'
})


export default function VideoDrawer ({refreshList, onClose, onClick}) {

  const {
    selectedVideos
  } = React.useContext(SplooshContext); 

  const drawerOpen = !!selectedVideos?.length;
  if (!selectedVideos.length) return <i>no videos selected</i>

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


  const castModels = async (index = 0) => {
    if (index < videoOne.models.length) {
      const model = videoOne.models[index];  
      const cast = await castModel(model.ID);
      return await castModels(++index);
    } 
  }


  const multiModel = async (modelList, index = 0) => {
    if (index < modelList.length) {
      const ID = modelList[index];  
      const cast = await castModel(ID);
      return await multiModel(modelList, ++index);
    } 
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
          <Flex spaced sx={{pl: 1}}>
            <Box>
            Edit Video
            </Box> 
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
            {videoOne.models?.map((star, i) => <LI dense key={i}>

              <Avatar size="small" sx={{mr: 1}} variant="rounded" src={star.image} alt={star.Name} >{star.Name.substr(0,1)}</Avatar>

              <Typography variant="body2"  >{star.Name}</Typography>
              

              <Box className="menubox">
                <Delete onClick={() => dropModel(star.ID)} />
              </Box>

            </LI>)}
            </UL>
            <Line />
         </>}

     
        

         {!videoOne.models?.length && <ModelSelect onMultiple={multiModel} onSelect={castModel} onCreate={createModel} />}
          {!!videoRest.length && !!videoOne.models?.length && <Button onClick={() => castModels()} fullWidth variant="contained"
            >Add {videoOne.models?.length} model{videoOne.models?.length==1?'':'s'} to {selectedVideos.length} videos</Button>}

          </Box>

          {/* <pre>{JSON.stringify(selectedVideos,0,2)}</pre> */}
        </Drawer>
  </>
}