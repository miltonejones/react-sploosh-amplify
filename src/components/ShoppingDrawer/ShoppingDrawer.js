import React from 'react';
import { 
  Box, 
  Badge,
  TextField,
  Tooltip,
  Divider,
  Button,
  IconButton,
  Typography,
  Collapse,
  Pagination,
  LinearProgress,
  InputAdornment ,
  Stack
} from '@mui/material';
import { styled, Drawer } from '@mui/material';
import { 
  SystemDialog, 
  useSystemDialog ,
  UL,
  LI,
  Flex,
  TextBox
} from '../';
import { Close, Sync, Add, Search, CheckBox, Check, Save } from '@mui/icons-material';
import { getParsers } from '../../connector/ParserConnector';
import { getVideosBySite } from '../../connector/ParserConnector';
import { getVideosByText } from '../../connector/ParserConnector';
import { getVideoByURL } from '../../connector/ParserConnector';
import { saveVideo } from '../../connector/DbConnector';
import { getVideosByURL } from '../../connector/ParserConnector';
import Observer from '../../services/Observer';

export const importComplete = new Observer();

const textBoxProps = {
  autoComplete: "off", 
  size: "small", 
  // sx: { ml: 2, mt: 0.75}
}


const ParserList = ({ parserList: list, selectedParsers, selectParser }) => {
  if (!list?.length) {
    return <em>loading....</em>
  }

  return <>
  {list.map(item => <LI
  onClick={() => selectParser(item.domain)}
  selected={selectedParsers.some(f => f === item.domain)}
  key={item.domain}>{item.domain}</LI>)}
  </>
}

const Frame = styled(Stack)(({selected }) => ({
  outline: selected ? 'dotted 2px #37a' : 'none' 
}))

const Text = styled(Typography)(({ fullWidth, error  }) => ({
  maxWidth: fullWidth ? '300px' : '140px',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden', 
  color: !error ? 'black' : 'red'
}))
 
const Excel = styled(Box)({
  display: 'grid',
  lineHeight: 1,
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: '0.2rem', 
  '& img': {
    width: 140, 
    height: 'auto'
  }
});

const Line = styled(Divider)({
  margin: '8px 0'
})

/**
 * SearchBox
 */
const SearchBox = ({onChange, onEnter, saveMode, ...props}) => {
  const [value, setValue] = React.useState(props.value);
  const change = e => {
    setValue(e.target.value);
    onChange && onChange(e.target.value, e);
  }

  const TextIcon = !!saveMode ? Add : Search;
  const SearchIcon = !!value ? Close : TextIcon;

  const icon = !!props.busy 
    ? <Sync className="spin" />
    : <SearchIcon />

  const  InputProps={
    endAdornment: <InputAdornment position="end">
        <Tooltip title="Search">
      <IconButton onClick={() => {
        change({target: {value: ''}})
      }}>{icon}</IconButton></Tooltip>
    </InputAdornment>,
  };


  const args = {
    ...props,
    ...textBoxProps,
    onChange: change,
    onKeyUp: ({ keyCode }) => keyCode === 13 && onEnter(value),
    InputProps,
    placeholder: saveMode ? 'Add video URL' : `Search for videos`,
    value
  }

  return <TextField {...args}/>
}

const pageSize = 24;

/**
 * ShoppingDrawer 
 */
export default function ShoppingDrawer ({open, onClose, onClick}) {
  const [state, setState] = React.useState({
    parserList: [],
    showParsers: true,
    minWidth: 320,
    saveMode: false,
    httpMode: false,
    searchPage: 1,
    selectedParsers: [],
    selectedVideos: [],
    statusText: ''
  });
  const { 
    searchPage,
    parserList, 
    saveMode,  
    httpMode,
    selectedParsers, 
    searchResults, 
    showParsers, 
    minWidth ,
    progress,
    selectedVideos,
    statusText
} = state;

  const selectParser = (p) => {
    const updated = selectedParsers.some(f => f === p)
      ? selectedParsers.filter(f => f !== p)
      : selectedParsers.concat(p);
    setState({...state, selectedParsers: updated})
  }

  React.useEffect(() => {
    !parserList.length && (async () => {
      const p = await getParsers();
      setState({...state, parserList: p.filter(f => !!f.pageParser)})
    })()
  }, [parserList])

  // const setProgress = (index, length) => setState({...state, progress: Math.ceil(((index + 1) / length) * 100)});

  const loopVideos = async (v, index = 0, out = []) => {
    if (index < selectedParsers.length) {
      const e = selectedParsers[index];
      const p = Math.ceil(((index + 1) / selectedParsers.length) * 100);
      // setProgress(index, selectedParsers.length);
      setState({...state, progress: p, statusText: `Searching ${e}...`})
      const res = await getVideosByText(`http://${e}/`, v);
      out = out.concat(res.videos);
      return await loopVideos(v, ++index, out)
    }
    setState({...state, statusText: 'Done', showParsers: !1, searchResults: out, minWidth: 960}) 
  }

  const getVideos = async (v) => {
    if (httpMode) {
      setState({...state, statusText: `Searching ${v}...`})
      const res = await getVideosByURL(v); 
      setState({...state, statusText: 'Done', showParsers: !1, searchResults: res.videos, minWidth: 960}) 
      return;
    }
    if (saveMode) {
      setState({...state, statusText: `Saving ${v}...`})
      const b = await getVideoByURL(v);
      const c = await saveVideo(b);
      console.log ({ b, c });
      importComplete.next();
      setState({...state, statusText: 'Done', saveMode: !1}) 
      return;
    }
    return loopVideos(v) 
  }

  const timeSort = (a,b) => a.CalculatedTime > b.CalculatedTime ? -1 : 1;
  const first = pageSize * (searchPage - 1);
  const shown = searchResults?.sort(timeSort).slice(first, first + pageSize);

  const saveEvery = async (index = 0) => {
    const { added = [] } = state;
    if (index < selectedVideos.length) {
      const p = Math.ceil(((index + 1) / selectedVideos.length) * 100);
      // setProgress(index, selectedVideos.length);
      const current = selectedVideos[index];
      setState({...state, current, progress: p, minWidth: 320, statusText: `Saving ${current}...` })
      const b = await getVideoByURL(current);
      const c = await saveVideo(b);
      console.log ({ b, c })
      return await saveEvery(++index)
    }
    alert ('all items saved');
    importComplete.next();
    resetState();
  }

  const selectEvery = () => {
    const updated = selectedVideos.length 
      ? []
      : shown.map(f => f.URL);
    setState({...state, selectedVideos: updated.filter(f => !f.existing)})
  }

  const selectOne = async (v) => { 
    const updated = selectedVideos.some(f => f === v) 
      ? selectedVideos.filter(f => f !== v)
      : selectedVideos.concat(v)
    setState({...state, selectedVideos: updated})
  }

  const resetState = () => setState({
    ...state, 
    showParsers: !0, 
    selectedVideos: [],
    searchResults: [], 
    added: [], 
    current: null, 
    minWidth: 320,
    searchPage: 1,
    statusText: 'Ready',
    progress: 0
  });

  const preview = !state.current ? null : searchResults.find(f => f.URL === state.current)


  return <>
    <Drawer  
      anchor="left"
      open={open}
      onClose={onClose}
      >

      <Flex spaced sx={{pl: 1}}>
        <Box>
          Shop for Videos
        </Box> 
         <IconButton  onClick={() => setState({...state, saveMode: !saveMode})}   
          ><Add /></IconButton> 
      </Flex>
           
      <Divider />


      <Box sx={{ p: 1, minWidth }}>
      
 

        <Collapse in={!searchResults?.length}>

          <SearchBox 
              onChange={v => setState({...state, httpMode: !saveMode && (v.indexOf('http') > -1)})}
              saveMode={saveMode} 
              label={saveMode ? "Add Video" : "Find Videos"} 
              placeholder="Search" 
              onEnter={getVideos} 
            />

        </Collapse>

        <Box sx={{maxWidth: 300, overflow: 'hidden'}}><Text error variant="caption">{statusText}</Text></Box>
       
      {/* [{progress}] */}
      
      {!!progress && <LinearProgress sx={{mb: 1}} variant="determinate" value={progress} />}
      {!!preview && <Thumb res={preview} />}

        <Collapse sx={{mt: 2}} in={showParsers && !saveMode && !httpMode}>
          <Typography variant="caption" sx={{mb: 1}}>CHOOSE SITES TO SEARCH</Typography>
          <ParserList {...state} selectParser={selectParser}/>
        </Collapse>
       
        <Collapse in={!state.current && !!searchResults?.length}>
         
          <Flex spaced>
            <Pagination  count={Math.ceil(searchResults?.length / pageSize)} page={searchPage} onChange={(x,y) => {
                setState({...state, searchPage: y})
              }}  />

            <Box>
              <IconButton onClick={() => saveEvery()}>
                <Save />
              </IconButton>
              <Badge color="error" badgeContent={selectedVideos?.length}>
                <IconButton onClick={selectEvery}>
                  <Check />
                </IconButton>
              </Badge>
              <IconButton onClick={resetState}>
                <Close />
              </IconButton>
            </Box>
          </Flex>
        </Collapse>

       {!state.current &&  <Excel sx={{m: 1}}>
          {searchResults?.map && shown?.filter(f => !!f).map(res => <Thumb  
            res={res}
            onClick={() => selectOne(res.URL)} 
            selected={selectedVideos?.some(f => f === res.URL)}/>)}
        </Excel>}
 
      </Box>

    </Drawer>
  </>


}

const Thumb = ({res, ...props}) => {
  return <Tooltip title={res.Text}><Frame  
    {...props}
    sx={{padding: '0 10px', maxWidth: 140, opacity: res.existing ? 0.3 : 1}}>
    <img key={res.Text} src={res.Photo} alt={res.Text} />
    <Text variant="body2">{res.Text}</Text> 
    <Flex spaced>
      <Text variant="caption">{res.domain}</Text>
      <Text variant="caption">{res.Time}</Text> 
    </Flex>
  </Frame></Tooltip>
}