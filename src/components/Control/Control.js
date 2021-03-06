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
import { Close, Add, Refresh, ArrowForward } from '@mui/icons-material';
import { findVideos } from '../../connector/DbConnector';
import { addModelToVideo } from '../../connector/DbConnector';


export const Flex = styled(Box)(({align = 'center', spaced, fullWidth}) => ({
  display: 'flex',
  alignItems: align,
  width: fullWidth ? '100%' : 'inherit',
  justifyContent: spaced ? 'space-between' : ''
}))

const Tab = styled(Typography)(({selected}) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  padding: '8px 16px 4px 16px',
  borderRadius: '0 4px 0 0',
  fontWeight: selected ? 600 : 400,
  borderBottom: selected ? 'solid 3px #37a' : 'solid 3px #eaeaea',
  backgroundColor: selected ? '#dadada' : '#fff',
  '& .child': { 
    color: selected ? '#37a' : '#222',
    maxWidth: selected ? 180 : 120,
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
    {items.map((child, o) => <Tooltip key={o} title={child}><Tab 
      variant={o === value ? "body2" : "caption"}
      selected={o === value}>
      <Box className="child" onClick={e => onChange(false, o)}>{child}</Box>
      {!0 && <Close 
        sx={{color: o > 0 ? (readonly ? '#fff' : '#000') : '#ccc'}}
        onClick={() => removeTab(child, o === value)} className="btn"
        />}
      </Tab></Tooltip>)}
      <Tab sx={{flexGrow: 1, color: '#fff'}}>M<Close sx={{color: '#fff'}} /></Tab>
  </Flex>
  
}

const downloadImage = src => new Promise((yes, no) => {
  fetch(src)
  .then(response => response.blob())
  .then(blob => yes(URL.createObjectURL(blob)))
  .catch(e => console.log ({ e }, no()));
})

const getImage = (src) => new Promise((yes, no) => {
  const im = new Image();
  im.onload = () => { 
    yes(src);
  } 
  im.onerror = () => { 
    downloadImage(src)
      .then(yes)
      .catch(no); 
  } 
  // if (src.indexOf('http') < 0) {
  //   return downloadImage('https:'+src)
  //     .then(yes)
  //     .catch(no); 
  // }
  im.src = src;
})

export const Picture = ({src, alt, sx, onClick, ...props}) => {
  const [ok, setOk] = React.useState(false);
  React.useEffect(() => {
    getImage(src)
      .then((source) => setOk(source))
      .catch(() => setOk(false)); 
  }, [src]);
  if (!ok) {
    return <div style={{...sx, overflow: 'hidden'}}><Typography sx={{m: 1}} variant="caption">{alt}</Typography></div>
  }
  return <Box onClick={() => onClick && onClick()}
    ><img {...props} style={sx} src={ok} alt={ok} /></Box>
}
 

export const StyledPagination = ({ totalPages, page, handleChange }) => {
  if (totalPages < 2) {
    return <i />;
  }
  return (
    <Flex>
      <Pagination 
      color="primary"
      showFirstButton
      showLastButton
      shape="rounded"
      count={totalPages}
      page={page}
      siblingCount={2}
      onChange={handleChange}
    />
    <IconButton onClick={() => {
      const num = prompt('Enter page number', page)
      if (!num) return;
      handleChange(null, num)
    }}>
      <ArrowForward />
    </IconButton>
    </Flex>
  );
};

const Expando = styled(Box)(({ on }) => ({
  width: on ? 240 : 0,
  overflow: 'hidden',
  transition: 'width 0.2s linear'
}))

export const TextBoxes = ({textProps, selectedIndex, ...props}) => {
  return textProps.map((prop, i) => <Expando 
    key={i} 
    on={selectedIndex === i}
    >{selectedIndex === i ? <TextBox {...props} {...prop}/> : <i/>}</Expando>)
}


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
}));

export const StarCaster = ({ Key, ID, models, videoFail, videoChanged }) => {
  const [status, setStatus] = React.useState('Add model...')
  const [className, setClass] = React.useState('')

  const castModel = async (id, stars, index = 0) => {
    if (index < stars.length) { 
      const cast = await addModelToVideo(id, stars[index].ID); 
      return await castModel(id, stars, ++index);
    } 
    return false;
  }

  const done = () => {
    setStatus('Add model...');
    setClass('');
  }

  const go = () => {
    setStatus('Looking up model...');
    setClass('spin');
  }

  const fail = () => {
    setStatus('No model found');
    setClass('');
    videoFail && videoFail()
  }

  const onModel = async() => {
    if (!Key) return done();
    go()
    const filter = models => f => !models.length || !models.some(m => m.ID === f.ID);
    const otherVideos = await findVideos(Key);
    const matchingVideos = otherVideos.records.filter(f => 
      f.Key === Key && 
      f.ID !== ID && 
      !!f.models?.length
      );  
    if (!matchingVideos.length) return fail();
    const result = matchingVideos[0].models.filter(filter(models));
    if (result?.length) {
      setStatus('Updating video...');
      await castModel(ID, result); 
      videoChanged && videoChanged();
      done();
      setStatus('Please wait...');
      return;
    }
    fail()
  }

  const Icon = className === 'spin'
    ? Refresh
    : Add

  return  <Flex><b>Models: </b> <Icon className={className} sx={{w:16,h:16}} /> 
    <b className="red action">
  <u onClick={() => onModel()}>
  {status}
  </u> 
</b> 
  </Flex>
}