import React from 'react';
import { 
  Pagination,
  Button,
  DialogActions,
  Dialog,
  DialogContent,
  DialogContentText,
  Stack, 
  TextField,
  DialogTitle
} from '@mui/material';


 

export const StyledPagination = ({ totalPages, page, handleChange }) => {
  if (totalPages < 2) {
    return <i />;
  }
  return (
    <Pagination
      sx={{p: 1}}
      color="primary"
      showFirstButton
      showLastButton
      shape="rounded"
      count={totalPages}
      page={page}
      siblingCount={2}
      onChange={handleChange}
    />
  );
};

export const TextBox = ({onChange, onEnter, ...props}) => {
  const [value, setValue] = React.useState(props.value);
  const change = e => {
    setValue(e.target.value);
    onChange(e.target.value);
  }
  return (<TextField   
    size="small"
    autoFocus
    {...props} 
    value={value}
    onKeyUp={(e) => e.keyCode === 13 && onEnter(value)}
    onChange={change}
    />)
}

export const SystemDialog = ({open, title, onYes, onNo, onClose, message, prompt}) => {
  const [value, setValue] = React.useState('');
  const whenYes = () => {
    if (prompt) {
      return onYes(value) 
    }
    onYes(true)
  }
  return (<><Dialog
    classes={{root: 'modal', paper: 'modal'}}
    open={open}
    onClose={onClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
   {!!title && (<DialogTitle sx={{mb: 1, pb: 0}} id="alert-dialog-title">
      {title}
    </DialogTitle>)}
    <DialogContent>
      <Stack>
        <DialogContentText sx={{mb: 1}} id="alert-dialog-description">
        {message}
        </DialogContentText>
        {!!prompt && <TextBox onEnter={onYes} onChange={setValue} />}
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button sx={{mb: 2, mr: 2}} onClick={onNo}>Cancel</Button>
      <Button sx={{mb: 2, mr: 2}} variant="contained" onClick={whenYes}  
      >okay</Button> 
    </DialogActions>
  </Dialog></>)
}


export function useSystemDialog() {
  const [systemDialogState, setState] = React.useState({ open: false }); 
  const Prompt = (message, defaultValue, title) => new Promise(yes => {
    setState({
      open: true,
      message,
      defaultValue,
      title,
      onYes: v => {
        yes(v);
        setState({open: false})
      },
      onNo: () => {
        yes(false)
        setState({open: false})
      },
      prompt: true,
      onClose: () => setState({ open: false }),
    });
  });

  return { systemDialogState, Prompt };
}


