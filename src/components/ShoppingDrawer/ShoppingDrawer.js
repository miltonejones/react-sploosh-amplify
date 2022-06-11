import React from 'react';
import { 
  Avatar,
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
  TextBox,
  Picture
} from '../';
import { Close, Sync, Add, Search, CheckBox, Check, Save } from '@mui/icons-material';
import { getParsers } from '../../connector/ParserConnector';
import { getVideosBySite } from '../../connector/ParserConnector';
import { getVideosByText } from '../../connector/ParserConnector';
import { getVideoByURL } from '../../connector/ParserConnector';
import { saveVideo } from '../../connector/DbConnector';
import { getVideosByURL } from '../../connector/ParserConnector';
import Observer from '../../services/Observer';
import dynamoStorage from '../../services/DynamoStorage';

export const importComplete = new Observer();

const textBoxProps = {
  autoComplete: "off", 
  size: "small", 
  // sx: { ml: 2, mt: 0.75}
}

const PageNum = styled(Avatar)(({ selected }) => ({
  width: 32, 
  height: 32, 
  marginLeft: 4, 
  fontSize: '.8rem', 
  bgcolor: selected ? 'orange' : '',
  cursor: 'pointer'
}));

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
 
const Status = styled(Box)(({minWidth}) => ({
  maxWidth: minWidth,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden' 
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

const wait = secs => new Promise(yes => {
  console.log ('waiting %ss', secs);
  setTimeout(yes, secs * 999);
})


const useParserList = () => {  
  const cookieName = 'selected-parser-items' 
  const store = dynamoStorage();
  const getParserList = async() => {
    const list = await store.getItem(cookieName);  
    return JSON.parse(list || '[]');
  }
  const setParserList = async(value) => {
    await store.setItem(cookieName, JSON.stringify(value))  
  }
  return {  
    getParserList,
    setParserList 
  }
}


/**
 * ShoppingDrawer 
 */
export default function ShoppingDrawer ({open, videoDrawerData, onClose, onClick}) {
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
    statusText,
    searchPages
} = state;
  const {  
    getParserList,
    setParserList 
  } = useParserList();

  const selectParser = (p) => {
    const updated = selectedParsers.some(f => f === p)
      ? selectedParsers.filter(f => f !== p)
      : selectedParsers.concat(p);
    setParserList(updated);
    setState({...state, selectedParsers: updated})
  }

  React.useEffect(() => {
    !parserList.length && (async () => {
      const p = await getParsers();
      const c = await getParserList();
      setState({...state, selectedParsers: c, parserList: p.filter(f => !!f.pageParser)})
    })()
  }, [parserList])
 

  const loopVideos = async (v) => { 
    setState({...state, minWidth: 320, progress:1, statusText: `Finding videos like '${v}'...` })
    return await findVideos(v)
  }

  const pageVideos = async (domain, pages, percent, pageNum = 1, out = []) => {
    const currentPage = pages.find(p => p[1] > pageNum);
    if (!currentPage) {
      return out;
    }
    
    const [path, num] = currentPage;
    const address = `${domain}${path}`;
    // alert (JSON.stringify(address) + ' --> ' + num);
    const res = await getVideosByURL(address); 
    // alert (JSON.stringify(res?.videos))
    !!res.videos && (out = out.concat(res.videos));

    const size = res?.videos?.length ?? 0;

    // update progress
    setState({...state, progress: percent, statusText: `Found ${size} videos on '${domain}' page ${num}...`});

    await wait (2);

    if (!!num && !!res?.pages?.length && num < 4) {
      const nextPage = res.pages.find(p => p[1] > num);
      // alert (JSON.stringify(nextPage))
      return pageVideos(domain, res.pages, percent, num, out);
    }
    
    return out;
  }

  const findVideos = async (v, options = {}) => { 
    let { index = 0, out = [], pageNum = 1, pages, text } = options;
    if (index < selectedParsers.length) {
      const e = selectedParsers[index];
      const p = Math.ceil(((index + 1) / selectedParsers.length) * 100); 

      console.log({ pageNum, pages });
      
      // build base URL from parser domain
      const s = `https://${e}/`; 

      const res = await getVideosByText(s, v); 

      // append videos to collection
      out = out.concat(res.videos);

      await wait (2);

      if (res?.pages?.length) {
        const more = await pageVideos(`https://${e}`, res.pages, p);
        if (more?.length) {
          out = out.concat(more)
        }
      } 

      // update progress
      setState({...state, progress: p,  statusText: `Found ${out.length} videos on ${e}...`});

      return await findVideos(v, {
        ...options,
        pages: res.pages,
        index: ++index,
        out,
        text: s
      } );
    }

    setState({
      ...state, 
      statusText: '', 
      showParsers: !1, 
      searchText: text, 
      searchPages: pages, 
      searchResults: out, 
      minWidth: 960
    }) 
  }

  const pageTo = async(uri) => {
    const { searchText } = state;
    const domain = /(\w+:\/\/[^/]+)/.exec(searchText); 
    alert (domain+'--'+uri)
    return await getVideos(domain[0] + uri, !0);
  }

  const getVideos = async (v, http) => {
    if (httpMode || http) {
      setState({...state, progress: 1, statusText: `Searching ${v}...`})
      const res = await getVideosByURL(v); 
      setState({
        ...state, 
        progress: 0, 
        statusText: '', 
        searchText: v,
        searchPage: 1,
        showParsers: !1, 
        searchPages: res.pages, 
        searchResults: res.videos, 
        minWidth: 960}) 
      return;
    }
    if (saveMode) {
      setState({...state, progress: 1, statusText: `Saving ${v}...`})
      const b = await getVideoByURL(v);
      const c = await saveVideo(b); 
      importComplete.next();
      setState({...state, progress: 0, statusText: '', saveMode: !1}) 
      return;
    }
    return loopVideos(v) 
  }

  const timeSort = (a,b) => a.CalculatedTime > b.CalculatedTime ? -1 : 1;
  const first = pageSize * (searchPage - 1);
  const shown = searchResults?.sort(timeSort).slice(first, first + pageSize);

  const saveEvery = async () => {
    setState({...state, minWidth: 320, progress:1, statusText: `Uploading ${selectedVideos.length} videos...` })
    return await uploadEvery()
  }

  const uploadEvery = async (index = 0) => {
    const { added = [] } = state;
    if (index < selectedVideos.length) {
      const p = Math.ceil(((index + 1) / selectedVideos.length) * 100); 
      const current = selectedVideos[index];
      const b = await getVideoByURL(current);
      const c = await saveVideo(b); 
      setState({...state, current, progress: p, minWidth: 320, statusText: `Saved ${current}...` })
      return await uploadEvery(++index)
    } 
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
    statusText: '',
    searchPages: null,
    progress: 0,
  });

  const preview = !state.current ? null : searchResults.find(f => f.URL === state.current)

  const icon = !!progress
    ? <Sync className="spin" />
    : <Search/>

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


      <Box sx={{ p: 1, minWidth, transition: "width 0.2s linear" }}>
      
      {!!searchPages && !progress && <Flex sx={{gap: 1}}>
        
        <Typography variant="caption">OTHER PAGES FOR THIS SEARCH</Typography>
        
        {searchPages.map(page => <PageNum
            onClick={() => pageTo(page[0])}
            key={page[1]}>{page[1]}</PageNum>)}</Flex>}
 
 

        <Collapse in={!searchResults?.length}>

          {!videoDrawerData && <SearchBox 
              onChange={v => setState({...state, httpMode: !saveMode && (v.indexOf('http') > -1)})}
              saveMode={saveMode} 
              label={saveMode ? "Add Video" : "Find Videos"} 
              placeholder="Search" 
              onEnter={getVideos} 
              disabled={!!progress}
              busy={progress}
            />}

          {!!videoDrawerData && <Button 
              fullWidth
              disabled={!!progress}
              onClick={() => getVideos(videoDrawerData)}
              variant="contained"
              >Search for {videoDrawerData} {icon}</Button>}

        </Collapse>

        <Status minWidth={minWidth}><Text error variant="caption">{statusText}</Text></Status>
       
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
    <Picture key={res.Text} src={res.Photo} alt={res.Text} />
    <Text variant="body2">{res.Text}</Text> 
    <Flex spaced>
      <Text variant="caption">{res.domain}</Text>
      <Text variant="caption">{res.Time}</Text> 
    </Flex>
  </Frame></Tooltip>
}