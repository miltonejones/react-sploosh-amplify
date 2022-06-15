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
  Spacer,
  TextBox,
  Picture
} from '../';
import { Close, Sync, Add, Search, CheckBox, Check, Save, ExpandMore, ExpandLess } from '@mui/icons-material';
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
  width: 24, 
  height: 24, 
  marginLeft: 2, 
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
    autoFocus: true,
    fullWidth: true,
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

const dressAddress = (domain) => p => {
  const address = p[0].indexOf('://') > 0 
    ? p[0]
    : `https://${domain}${p[0]}`
  return [
    address,
    p[1],
    domain
  ]
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
    sessionList = [],
    searchPages = [],
    searchLabel
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
    setState({
        ...state, 
        minWidth: 320, 
        progress:1, 
        statusText: `Finding videos like '${v}'...`  
      })
    const results = await findVideos(v);
    const list = sessionList.concat(results)
    setState({
      ...state, 
      ...results,
      sessionList: list, 
      statusText: '',   
      showParsers: !1, 
      showSessionList: !1, 
      minWidth: 960
    }) 
  }

  const pageVideos = async (domain, pages, percent, pageNum = 1, out = []) => {
    const currentPage = pages.find(p => p[1] > pageNum);
    if (!currentPage) {
      return out;
    }

    let addresses;
    
    const [address, num] = currentPage; 
    // alert (JSON.stringify(address) + ' --> ' + num);
    const res = await getVideosByURL(address); 
    // alert (JSON.stringify(res?.videos))
    !!res.videos && (out = out.concat(res.videos));

    const size = res?.videos?.length ?? 0;

    // update progress
    setState({...state, progress: percent, statusText: `Found ${size} videos on '${address}...`});

    const videoOne = res.videos?.[0] 
    importComplete.next({
      progress: percent,
      statusText: `Found ${size} videos on '${address}...` ,
      image: videoOne?.Photo
    });


    await wait (2);

    if (!!num && !!res?.pages?.length && num < 4) { 
      addresses = res.pages.map(dressAddress(domain)); 
      return pageVideos(domain, addresses, percent, num, out);
    }
    
    return out;
  }

  const findVideos = async (v, options = {}) => { 
    
    let { index = 0, out = [], pageNum = 1, pages, text } = options;
    let addresses;

    if (index < selectedParsers.length) {
      const e = selectedParsers[index];
      const p = Math.ceil(((index + 1) / selectedParsers.length) * 100); 
 
      
      // build base URL from parser domain
      const domain = `https://${e}`; 

      const res = await getVideosByText(domain + '/', v); 

      // append videos to collection
      out = out.concat(res.videos);

      await wait (2);

      if (res?.pages?.length) {
        addresses = res.pages.map(dressAddress(e));
        const more = await pageVideos(e, addresses, p);
        if (more?.length) {
          out = out.concat(more)
        }
      } 


      // update progress
      setState({...state, progress: p,  statusText: `Found ${out.length} videos on ${e}...`});
      
      const videoOne = res.videos?.[0] 
      importComplete.next({
        progress: p,
        statusText: `Found ${out.length} videos on ${e}...` ,
        image: videoOne?.Photo
      });

      return await findVideos(v, {
        ...options,
        pages: addresses,
        index: ++index,
        out,
        text: domain
      } );
    }

    importComplete.next({
      progress: 100, 
      complete: true 
    });

    const from = selectedParsers.length > 1 
      ? `${selectedParsers.length} sites`
      : selectedParsers[0]

    // console.log ({ pages, searchPages })

    const results = {
      searchLabel: `Videos like '${v}' from ${from}`, 
      searchPages: searchPages
      .filter(f => !!f && !pages?.some(e => !!e && e[0] === f[0] && e[2] === f[2]))  
      .concat(pages), 
      searchResults: out, 
    };

    return results;

  }

  const pageTo = async(uri) => {
    const { searchText } = state;
    const domain = /(\w+:\/\/[^/]+)/.exec(searchText);   
    return await getVideos(uri, !0);
  }

  const getVideos = async (v, http) => {
    if (httpMode || http) {
      const domain = /\w+:\/\/([^/]+)/.exec(v);  
      setState({...state, progress: 1, statusText: `Searching ${v}...`})  
      const res = await getVideosByURL(v); 
      const addresses = !domain ? [] : res.pages?.map(dressAddress(domain[1])); 

      console.log ({ addresses, searchPages})
      const results = {
        searchLabel: `Videos from URL '${v}'`, 
        searchPages: searchPages
        .filter(f => !!f && !addresses?.some(e => !!e && e[0] === f[0] && e[2] === f[2]))  
        .concat(addresses), 
        searchResults: res.videos, 
      };
  
      const list = sessionList.concat(results) 

      setState({
        ...state,
        ...results, 
        sessionList: list,
        progress: 0, 
        statusText: '', 
        searchText: v,
        searchPage: 1,
        showParsers: !1,  
        showSessionList: !1,
        minWidth: 960
      }) 
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
      importComplete.next({
        progress: p,
        statusText: `Saved ${b.title || current}...`,
        video: b
      });
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
    showSessionList: !1,
    selectedVideos: [],
    searchResults: [], 
    added: [], 
    current: null, 
    minWidth: 320,
    searchPage: 1,
    statusText: '',
    searchPages: [],
    searchLabel: null,
    progress: 0,
  });

  const preview = !state.current ? null : searchResults.find(f => f.URL === state.current);

  const icon = !!progress
    ? <Sync className="spin" />
    : <Search/>

  return <>
    <Drawer  
      anchor="left"
      open={open}
      onClose={onClose}
      >

    {/* drawer header */}
      <Flex spaced sx={{pl: 1}}>
        <Box>
          Shop for Videos
        </Box> 
        <IconButton onClick={() => setState({...state, saveMode: !saveMode})}   
        ><Add /></IconButton> 
      </Flex>
           
      <Divider />

    {/* list of previous searches */}
     {!!sessionList.length && !progress && <> 
        <Flex>
          <Stack>
            {!searchResults?.length &&  <Badge color="primary" badgeContent={sessionList.length}><Typography sx={{m: 1}} variant="caption">PREVIOUS SEARCHES</Typography></Badge>}
            {sessionList 
            .map((sessionItem, i) =>  
              <ResultTitle on={sessionItem.searchLabel === searchLabel || state.showSessionList}>
                <Typography 
                  key={i} 
                  variant="caption" 
                  sx={{ 
                    p: 1, 
                    mb: 2, 
                    cursor: 'pointer', 
                    fontWeight: sessionItem.searchLabel === searchLabel ? 600 : 400 
                  }} 
                  onClick={() => setState({
                    ...state, 
                    ...sessionItem, 
                    showParsers: !1, 
                    searchPage: 1,  
                    minWidth: 960
                  })}
                >{sessionItem.searchLabel}</Typography>
              </ResultTitle>
            )}
          </Stack>
          <Spacer />
         <IconButton onClick={() => setState({...state, showSessionList: !state.showSessionList})}>
          {!!state.showSessionList ?  <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Flex>
        <Divider /> 
      </>
      }
        


      <Box sx={{ p: 1, minWidth, transition: "width 0.2s linear" }}>
      
      {/* search pages */}
      {!!searchPages.length && !progress && <Flex sx={{gap: 1}}>
      

     
        <Typography variant="caption">OTHER PAGES FOR THIS SEARCH</Typography>
        
        {searchPages.filter(d=>!!d).map(page => <PageNum
            onClick={() => pageTo(page[0])}
            key={page[1]}>{page[1]}</PageNum>)}</Flex>}
 
      {/* search textbox or button */}
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

      {/* status text */}
        <Status minWidth={minWidth}><Text error variant="caption">{statusText}</Text></Status>
       
      {/* [{progress}] */}
      {!!progress && <LinearProgress sx={{mb: 1}} variant="determinate" value={progress} />}
      
      {/* save thumbnail preview */}
      {!!preview && <Thumb res={preview} />}

      {/* list of parsers */}
        <Collapse sx={{mt: 2}} in={showParsers && !saveMode && !httpMode}>
          <Typography variant="caption" sx={{mb: 1}}>CHOOSE SITES TO SEARCH</Typography>
          <ParserList {...state} selectParser={selectParser}/>
        </Collapse>

      {/* search result pagination */}
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

      {/* search results */}
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


const ResultTitle = styled(Box)(({ on }) => ({
  height: on ? 24 : 0,
  marginTop: on ? 4 : 0,
  overflow: 'hidden',
  transition: 'height 0.2s linear'
}));

const Thumb = ({res, onClick, ...props}) => {
  return <Tooltip title={res.Text}><Frame {...props} 
    sx={{padding: '0 10px', maxWidth: 140, opacity: res.existing ? 0.3 : 1}}>
    <Picture onClick={onClick} {...props} 
     key={res.Text} src={res.Photo} alt={res.Text} 
     sx={{width: 140, height: 80}} />
    <Text onClick={() => {
      window.open(res.URL)
    }} variant="body2">{res.Text}</Text> 
    <Flex spaced>
      <Text variant="caption">{res.domain}</Text>
      <Text variant="caption">{res.Time}</Text> 
    </Flex>
  </Frame></Tooltip>
}