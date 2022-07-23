import * as React from 'react'; 
import { Dialog, DialogContent, styled } from '@mui/material'; 

export const PhotoModal = ({src, alt, open, onClose}) => {
  return <Dialog sx={{p: 2}} open={open} onClose={() => onClose(false)}>
     
    <DialogContent>
      <Picture onClick={() => onClose(src)} src={src} alt={alt} />
    </DialogContent>
  </Dialog>
} 


export const usePhotoModal = () => {
  const [photoModalState, setPhotoModalState] = React.useState({open: false});

  const showPhoto = ({src, alt}) => new Promise(resolve => {
    setPhotoModalState({
      open: true,
      src,
      alt,
      onClose: f => {
        setPhotoModalState({open: false});
        resolve(f)
      }
    })
  })

  return {
    showPhoto,
    photoModalState
  }
}

const Picture = styled('img')(() => ({
  width: 192,
  height: 'auto',
  cursor: 'pointer'
}))