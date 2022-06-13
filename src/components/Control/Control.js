import React from 'react';
import { 
  Pagination,
  Button,
  DialogActions,
  Dialog,
  IconButton,
  DialogContent,
  DialogContentText,
  Stack, 
  Tooltip,
  TextField,
  Box,
  DialogTitle,
  Typography,
  styled,
  InputAdornment
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
  padding: '8px 16px 4px 16px',
  borderRadius: '0 4px 0 0',
  borderBottom: selected ? 'solid 3px #37a' : 'solid 3px #eaeaea',
  backgroundColor: selected ? '#dadada' : '#fff',
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

export const Tabs = ({items, value, removeTab, onChange, readonly, ...props}) => {
  if (!items?.length) {
    return '';
  }

  return <Flex {...props}>
    {items.map((child, o) => <Tooltip key={o} title={child}><Tab selected={o === value}>
      <Box className="child" onClick={e => onChange(false, o)}>{child}</Box>
      {!readonly && <Close 
        sx={{color: o > 0 ? '#000' : '#ccc'}}
        onClick={() => removeTab(child, o === value)} className="btn"
        />}
      </Tab></Tooltip>)}
      <Tab sx={{flexGrow: 1, color: '#fff'}}>M{!readonly && <Close sx={{color: '#fff'}} />}</Tab>
  </Flex>
  
}

export const Picture = ({src, alt, sx, ...props}) => {
  const [ok, setOk] = React.useState(false);
  React.useEffect(() => {
    const im = new Image();
    im.onload = () => { 
      setOk(true);
    } 
    im.src = src;
  }, [src]);
  if (!ok) {
    return <div style={{...sx, overflow: 'hidden'}}><Typography sx={{m: 1}} variant="caption">{alt}</Typography></div>
  }
  return <img src={src} alt={alt} {...props} />
}
 

export const StyledPagination = ({ totalPages, page, handleChange }) => {
  if (totalPages < 2) {
    return <i />;
  }
  return (
    <Pagination
      sx={{pt: 1}}
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

export const TextBox = ({onChange, onEnter, allowClear, ...props}) => {
  const [value, setValue] = React.useState(props.value);
  const change = e => {
    setValue(e.target.value);
    onChange && onChange(e.target.value, e);
  }
  const  InputProps=allowClear && !!value?.length ? {
    endAdornment: <InputAdornment position="end">
      <IconButton onClick={() => {
        change({target: {value: ''}})
        onEnter('')
      }}><Close /></IconButton> 
    </InputAdornment>,
  } : null;

  return (<TextField   
    size="small"
    autoFocus
    {...props} 
    InputProps={InputProps}
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

export const LI = styled('li')(({ header, dense, selected }) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'relative', 
  padding: header ? '16px 8px' : (dense ? 2 : 8), 
  fontWeight: selected ? '700' : '400',
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