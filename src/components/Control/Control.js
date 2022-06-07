import React from 'react';
import { 
  Pagination,
  Button,
  DialogActions,
  Dialog,
  DialogContent,
  DialogContentText,
  Stack, 
  Tooltip,
  TextField,
  Box,
  DialogTitle,
  styled
} from '@mui/material';
import { Close } from '@mui/icons-material';


export const Flex = styled(Box)(({align = 'center', spaced, fullWidth}) => ({
  display: 'flex',
  alignItems: align,
  width: fullWidth ? '100%' : 'inherit',
  justifyContent: spaced ? 'space-between' : ''
}))

const Tab = styled(Box)(({selected}) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  padding: '12px 16px 4px 16px',
  borderBottom: selected ? 'solid 2px #37a' : 'solid 2px white',
  '& .child': { 
    color: selected ? '#37a' : '#222',
    maxWidth: 180,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  '& .btn': {
    marginLeft: 8,
    width: 16
  }
}))

export const Tabs = ({items, value, removeTab, onChange, ...props}) => {
  if (!items?.length) {
    return '';
  }

  return <Flex>
    {items.map((child, o) => <Tooltip key={o} title={child}><Tab selected={o === value}>
      <Box className="child" onClick={e => onChange(false, o)}>{child}</Box>
      {o > 0 && <Close onClick={() => removeTab(child, o === value)} className="btn"/>}
      </Tab></Tooltip>)}
  </Flex>
  
}
 

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
    onChange && onChange(e.target.value, e);
  }
  return (<TextField   
    size="small"
    autoFocus
    {...props} 
    value={value}
    onKeyUp={(e) => e.keyCode === 13 && onEnter && onEnter(value, e)}
    onChange={change}
    />)
}

export const SystemDialog = ({open, title, onYes, onNo, onClose, message, prompt, defaultValue}) => {
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
        {!!prompt && <TextBox value={defaultValue} onEnter={onYes} onChange={setValue} />}
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

  const Confirm = (message, title) => new Promise(yes => {
    setState({
      open: true,
      message, 
      title,
      onYes: v => {
        yes(v);
        setState({open: false})
      },
      onNo: () => {
        yes(false)
        setState({open: false})
      }, 
      onClose: () => setState({ open: false }),
    });
  });

  return { systemDialogState, Prompt, Confirm };
}



export const UL = styled('ul')({
  padding: 0,
  margin: 0,
  listStyle: 'none'
})

export const LI = styled('li')(({ header, dense }) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'relative', 
  padding: header ? '16px 8px' : (dense ? 2 : 8),
  cursor: 'pointer',
  '& .titlebox': {
    maxWidth: 300,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& .menubox': {
    cursor: 'pointer',
    position: 'absolute',
    right: 8,
    display: 'flex',
    gap: 8,
    opacity: 0
  },
  '&:hover': {
    textDecoration: 'underline',
    '& .menubox': {
      opacity: 0.3,
      '&:hover': {
        opacity: 1
      },
    },
  },
}))