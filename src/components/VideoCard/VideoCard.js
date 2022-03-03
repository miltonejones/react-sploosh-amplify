import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Avatar, Box } from '@mui/material';
import { CardActionArea } from '@mui/material';
import { RegionMenu } from '../';
import { WindowManagerService } from '../../services/WindowManager';

export default function VideoCard({ video }) {
  const [open, setOpen] = React.useState(false);
  if (!video) return <em>huh??</em>;
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="160"
          image={video.image}
          alt={video.title}
          onClick={() => setOpen(!open)}
        />
        <RegionMenu
          click={(i) => {
            WindowManagerService.launch(video, i);
            setOpen(false);
          }}
          open={open}
        />
        <CardContent>
          <Flex sx={{ width: '100%' }}>
            {!!video.models.length && (
              <Avatar src={video.models[0].image} alt={video.models[0].Name} />
            )}
            <Typography
              ml={!!video.models.length ? 2 : 0}
              variant="body2"
              color="text.secondary"
            >
              <Shorten limit={!!video.models.length ? 30 : 40}>
                {video.title}
              </Shorten>
            </Typography>
          </Flex>
          {!!video.models.length && (
            <Typography variant="caption" color="text.secondary">
              <b>Models:</b>{' '}
              <Shorten limit={20}>
                {video.models.map((f) => f.Name).join(', ')}
              </Shorten>
            </Typography>
          )}
          <Flex>
            <Typography variant="body2" color="text.secondary">
              {video.domain}
            </Typography>
            <Spacer />
            studio
          </Flex>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

const Flex = ({ children, ...props }) => (
  <div
    style={{ display: 'flex', alignItems: 'center', ...props.sx }}
    {...props}
  >
    {children}
  </div>
);

const Spacer = () => <Box sx={{ flexGrow: 1 }} />;

const Shorten = ({ children, limit = 40 }) => {
  const text = children.toString();
  if (text.length <= limit) return text;
  return text.substr(0, limit) + '...';
};
