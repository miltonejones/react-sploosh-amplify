import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Avatar, Box, IconButton, CardActionArea, Collapse, styled } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { RegionMenu } from '../';
// import { WindowManagerService } from '../../services/WindowManager';
import { Favorite, DeleteForever, Launch, MoreVert, MenuBook } from '@mui/icons-material';
import { useWindowManager } from '../../services/WindowManager';

const ERR_IMAGE = 'https://s3.amazonaws.com/sploosh.me.uk/assets/XXX.jpg';

const Heart = styled(Box)(() => ({
  position: 'absolute',
  right: 0,
  top: 0,
  opacity: 'var(--icon-opacity)'
}))

const View = styled(Card)(({selected, opacity, chosen}) => ({
  '--icon-opacity': 0.3,
  maxWidth: 345, 
  opacity, 
  outline: selected || chosen ? '3px dotted #37a' : '',
  position: 'relative' ,
  '&:hover': {
    '--icon-opacity': 1,
  }
}))


export default function VideoCard({ 
  video, 
  onClick, 
  onSearch, 
  getModel, 
  small, 
  onDrop, 
  onHeart, 
  selected, 
  readonly,
  chosen 
}) {
  const [open, setOpen] = React.useState(false);
  const [src, setSrc] = React.useState(ERR_IMAGE);
  const [showModels, setShowModels] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const WindowManager = useWindowManager()
  const height = small ? 100 : 160;
  const loadVideo = React.useCallback(() => {
    if (!video.image) {
      return setSrc(ERR_IMAGE);
    }
    const im = new Image();
    im.onerror = () => setSrc(ERR_IMAGE);
    im.onload = () => setSrc(video.image);
    im.src = video.image;
  }, [video]);
  React.useEffect(() => {
    !!video && loadVideo();
  }, [video]);
  if (!video) return <em>huh??</em>;
  const menuProps = small
    ? { width: 140, height: 100 }
    : { width: 220, height: 130 };
  const visited = WindowManager.visited(video);
  const opacity = visited ? 0.5 : 1;
  const likeButton = <IconButton onClick={() => { 
    onHeart && onHeart(video.ID);
    setShowMenu(false);
    }}>
    <Favorite style={{ color: video.favorite ? 'red' : 'gray' }} /> 
  </IconButton>

  return (
    <View 
    opacity={opacity}
    selected={selected}
    chosen={chosen}  
    elevation={video.favorite ? 6 : 1}>
      <CardActionArea>
        <Tooltip title={video.title}> 
            <CardMedia
              component="img"
              height={height}
              image={src}
              alt={video.title}
              onClick={() => {
                if (readonly) {
                  return onClick && onClick(video)
                }
                setOpen(!open)
              }}
            />
        </Tooltip>
      </CardActionArea>

      {!!small && <Heart>
        {likeButton}
      </Heart>}

      <RegionMenu
        {...menuProps}
        click={(i) => {
          WindowManager.launch(video, i);
          setOpen(false);
        }}
        open={open}
      />

    <Collapse in={showMenu}>
      
      <Flex style={{padding:12}}>
        {likeButton}
        <IconButton onClick={() => {
          onDrop(video.ID, video.title);
          setShowMenu(false);
        }}>
          <DeleteForever /> 
        </IconButton>
        <IconButton onClick={() => setShowMenu(false)} href={video.URL} target="_blank">
          <Launch  /> 
        </IconButton>
       {!!video.Key && <IconButton  
       onClick={() => setShowMenu(false)}
        href={`https://www.javlibrary.com/en/vl_searchbyid.php?keyword=${video.Key}`} target="_blank">
          <MenuBook  /> 
        </IconButton>}
      </Flex>

      </Collapse>
      {!small && (
        <CardContent>
          <Flex sx={{ width: '100%' }}>
            {!!video.models.length && (
              <Avatar
                src={video.models[0].image}
                alt={video.models[0].Name}
              />
            )}
            <Typography
              ml={!!video.models.length ? 2 : 0}
              variant="body2"
              color="text.secondary"
              onClick={() => onClick && onClick(video)}
              classes={{root: video.favorite ? "favorite" : ""}}
            >
              <Shorten limit={!!video.models.length ? 35 : 50}>
               {video.title}
              </Shorten>
            </Typography>
          </Flex>
            
          <Typography variant="caption" color="text.secondary">
            <b>Models:</b>{' '}

            {!!video.models.length && (
              <>
                <u className="action" onClick={() => getModel(video.models[0].ID)}>
                  <ModelName {...video.models[0]} /> 
                </u>{' '}
                {video.models.length > 1 && (
                  <b><u className="action" onClick={() => setShowModels(!showModels)}>
                  + {video.models.length - 1} more...
                </u></b>
                )}
              </> 
            )}
            {!video.models.length && (
              <b className="red action">
                <u >
                  Add model...
                </u> 
              </b> 
            )}
          </Typography>
            
          
          
          {video.models.length > 1 && (
            <Collapse in={showModels}>
              {video.models.map((f, i) => i > 0 && (
                <span key={f.ID} >
                  <u className="action" onClick={() => getModel(f.ID)}>
                    <ModelName {...f} />
                  </u>
                  {i < video.models.length - 1 && <i>, </i>}
                </span>
              ))}
            </Collapse>
          )}

          <Flex>
            <Typography variant="body2" color="text.secondary">
              {video.domain}
            </Typography>
            <Spacer />
            <u className="action" onClick={() => onSearch(`${video.studio}-`)}>{video.studio}</u>
            <IconButton onClick={() => setShowMenu(!showMenu)}>
              <MoreVert />
            </IconButton>
          </Flex>
        </CardContent>
      )}
      
    </View>

  );
}

const ModelName = ({Name, image}) => {
  if (!image) return Name;
  return (
    <Tooltip title={<img className="model-image" src={image} alt={Name} />}>
      <span>{Name}</span>
    </Tooltip>)
}

export const Flex = ({ children, ...props }) => (
  <div
    style={{ display: 'flex', alignItems: 'center', ...props.sx }}
    {...props}
  >
    {children}
  </div>
);

export const Spacer = () => <Box sx={{ flexGrow: 1 }} />;

export const Shorten = ({ children, limit = 40 }) => {
  const text = children.toString();
  if (text.length <= limit) return text;
  return (
    <Tooltip title={text}>
      <span className="action">{text.substr(0, limit) + '...'}</span>
    </Tooltip>
  );
};
