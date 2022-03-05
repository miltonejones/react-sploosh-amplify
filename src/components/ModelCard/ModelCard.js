import * as React from 'react';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const ERR_IMAGE = 'https://s3.amazonaws.com/sploosh.me.uk/assets/no-img-women.jpg';

export default function ModelCard({ ID, image, name, VideoCount, onClick }) {
    const [src, setSrc] = React.useState(null);
    const loadVideo = React.useCallback(() => {
        if (!image) {
            return setSrc(ERR_IMAGE);
        }
        const im = new Image();
        im.onerror = () => setSrc(ERR_IMAGE);
        im.onload = () => { 
            setSrc(image)
        };
        im.src = image;
    }, [image]);

    React.useEffect(() => {
        !src && loadVideo()
    }, [src])

  const Component = !!src ? CardMedia : Skeleton;

  return (
    <Card sx={{ maxWidth: 180 }} onClick={() => onClick(ID)}>
      <Component
      component="img"
        height="260"
        width="180"
        image={src}
        alt={name}
      />
      <CardContent>
        <Typography gutterBottom variant="subtitle1" component="div">
          {name} [{VideoCount}]
        </Typography> 
      </CardContent> 
    </Card>
  );
}
