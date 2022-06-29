import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Avatar, Box, IconButton, CardActionArea, Collapse, styled } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { RegionMenu, StarCaster } from '../';
// import { WindowManagerService } from '../../services/WindowManager';
import { Favorite, DeleteForever, MoreHoriz, Launch, Edit, MoreVert, Search, MenuBook } from '@mui/icons-material';
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

const CardMenu = styled(Box)(({ on }) => ({
  position: 'absolute',
  top: on ? 0 : -70,
  transition: 'top 0.2s linear',
  left: 0,
  width: '100%', 
  color: 'white',
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  zIndex: 3
}))


const Tip = styled(Tooltip)(() => ({ 
  '& .MuiTooltip-tooltip': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'solid 1px red !important',
    borderRadius: 0,
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
  onModel,
  selected, 
  readonly,
  onShop,
  chosen 
}) {
  const [open, setOpen] = React.useState(false);
  const [cursor, setCursor] = React.useState("pointer");
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
    style={ { cursor }}
    onMouseLeave={() => setShowMenu(false)}
    opacity={opacity}
    selected={selected}
    chosen={chosen}  
    elevation={video.favorite ? 6 : 1}>
      <CardActionArea
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}>
        <Tip title={video.title}> 
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
        </Tip>
      </CardActionArea>

      {!!small && !showMenu && <Heart>
        {likeButton}
      </Heart>}

      <RegionMenu
        {...menuProps}
        click={async (i) => {
          setCursor("progress")
          await WindowManager.launch(video, i);
          setCursor("pointer")
          setOpen(false);
        }}
        open={open}
      />

    <CardMenu on={showMenu && !open} 
      onMouseEnter={() => setShowMenu(true)}>
      
      <Flex sx={{justifyContent: 'center'}}>
        {likeButton}
       {!!onDrop && <IconButton onClick={() => {
          onDrop(video.ID, video.title);
          setShowMenu(false);
        }}>
          <DeleteForever /> 
        </IconButton>}

        <IconButton onClick={() => setShowMenu(false)} href={video.URL} target="_blank">
          <Launch  /> 
        </IconButton>

       {!!video.Key && !small && <>
        {!!onShop && <IconButton onClick={() => {
          onShop(video.Key)
          setShowMenu(false);
          }} >
          <Search  /> 
        </IconButton>}

        <IconButton  
          onClick={() => setShowMenu(false)}
          href={`https://www.javlibrary.com/en/vl_searchbyid.php?keyword=${video.Key}`} target="_blank">
          <MenuBook  /> 
        </IconButton>
       </>}
      </Flex>

      </CardMenu>


      {!small && (
        <CardContent>
          <Flex sx={{ width: '100%' }}>
            {!!video.models.length && (
              <Circle
                src={video.models[0].image}
                alt={video.models[0].Name}
              />
            )}
            <Typography
              ml={!!video.models.length ? 2 : 0}
              variant="body2"
              color="text.secondary"
              classes={{root: video.favorite ? "favorite" : ""}}
            >
              <Shorten onClick={() => onClick && onClick(video)} limit={!!video.models.length ? 35 : 50}>
               {video.title}
              </Shorten>
            </Typography>
          </Flex>
            
          <Typography variant="caption" color="text.secondary">

            {!!video.models.length && (
              <>
            <b>Models:</b>{' '}
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
              <StarCaster {...video} videoFail={() => onClick &&  onClick(video)} videoChanged={onModel} />
              // <b className="red action">
              //   <u onClick={() => onModel && onModel(video)}>
              //     Add model...
              //   </u> 
              // </b> 
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
              <u className="action" onClick={() => onSearch(`${video.domain}`, 'domain')}>{video.domain}</u>
            </Typography>
            <Spacer />
            <u className="action" onClick={() => onSearch(`${video.studio}-`)}>{video.studio}</u>
       
          </Flex>
        </CardContent>
      )}
      
    </View>

  );
}

const useImageLoader = (src) => {
  const [source, setSource] = React.useState(null);
  React.useEffect(() => {
    const im = new Image();
    im.onload = () => !!im && im.width > 10 && setSource(src);
    im.src = src;
  }, [src])
  return { source }
}

const Circle = ({src, alt}) => {
  const { source } = useImageLoader(src) 
  if (!source) {
    return <Avatar>{alt.substr(0, 1)}</Avatar>
  }
  return <Avatar src={source} alt={alt} />
}

const ModelName = ({Name, image}) => {
  const { source } = useImageLoader(image) 
  if (!source) return Name;
  return (
    <Tip title={<img className="model-image" src={image} alt={Name} />}>
      <span>{Name}</span>
    </Tip>)
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

// 
const Hover = styled(Box)(({ on }) => ({
  cursor: 'pointer',
  position: 'relative',
  outline: on ? 'solid 2px rgba(51, 119, 187, 0.3)' : '',
  outlineOffset: 4
}))

const Editor = styled(IconButton)(({ flipped }) => ({
  top: 0,
  right: 0,
  transform: flipped ? 'rotate(-90deg)' : 'rotate(0deg)',
  transition: 'transform 0.2s linear',
  position: 'absolute'
}))

export const Shorten = ({ children, onClick, limit = 40 }) => {
  const [hover, setHover] = React.useState(false);
  const [shown, setShown] = React.useState(false);
  const turnOn = () => {
    setHover(true); 
  }
  const turnOff = () => {
    setHover(false);
    setShown(false)
  }
  const text = children.toString();
  const edit = !hover 
    ? <i/>
    : <Editor flipped={shown} onClick={() => setShown(!shown)}><MoreHoriz /></Editor>
  if (shown || text.length <= limit) return <Hover on={shown}>{text}{edit}</Hover>;
  return ( 
      <Hover
        onMouseEnter={turnOn}
        onMouseLeave={turnOff}
        className="action">
        <Box onClick={onClick}>{text.substr(0, limit) + '...'}</Box>
        {edit}
      </Hover> 
  );
};
