import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Avatar, Box } from '@mui/material';
import { CardActionArea, Collapse } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { RegionMenu } from '../';
import { WindowManagerService } from '../../services/WindowManager';

const ERR_IMAGE = 'https://s3.amazonaws.com/sploosh.me.uk/assets/XXX.jpg';

export default function VideoCard({ video, onClick, getModel, small }) {
  const [open, setOpen] = React.useState(false);
  const [src, setSrc] = React.useState(ERR_IMAGE);
  const [showModels, setShowModels] = React.useState(false);
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
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height={height}
          image={src}
          alt={video.title}
          onClick={() => setOpen(!open)}
        />
        <RegionMenu
          {...menuProps}
          click={(i) => {
            WindowManagerService.launch(video, i);
            setOpen(false);
          }}
          open={open}
        />

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
                onClick={() => onClick(video)}
              >
                <Shorten limit={!!video.models.length ? 30 : 40}>
                  {video.title}
                </Shorten>
              </Typography>
            </Flex>
            {!!video.models.length && (
              <>
                <Typography
                  onClick={() => setShowModels(!showModels)}
                  variant="caption"
                  color="text.secondary"
                >
                  <b>Models:</b>{' '}
                  <u onClick={() => getModel(video.models[0].ID)}>
                    {video.models[0].Name}
                  </u>
                </Typography>
                {video.models.length > 1 && (
                  <Collapse in={showModels}>
                    {video.models.map((f, i) => (
                      <>
                        <u key={f.ID} onClick={() => getModel(f.ID)}>
                          {f.Name}
                        </u>
                        {i < video.models.length - 1 && <i>, </i>}
                      </>
                    ))}
                  </Collapse>
                )}
              </>
            )}
            <Flex>
              <Typography variant="body2" color="text.secondary">
                {video.domain}
              </Typography>
              <Spacer />
              studio
            </Flex>
          </CardContent>
        )}
      </CardActionArea>
    </Card>
  );
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
      <span>{text.substr(0, limit) + '...'}</span>
    </Tooltip>
  );
};
