import React from 'react';
import './style.css';
import useComponentState from './hooks/useComponentState';
import InputAdornment from '@mui/material/InputAdornment';
import { VideoCollection, Flex, Spacer } from './components';
import { TextField, Box , Tab, Tabs, Avatar, Collapse } from '@mui/material';
import { Search, Sync } from '@mui/icons-material';
import { BrowserRouter, useParams ,Routes, Route, useNavigate} from "react-router-dom";


function VideoGrid (props) {
  const {
    SearchIcon,
    iconClass,
    search,
    param,
    setState,
    args,
    navigate,
    queryParam,
    searches
  } = useApp();
  const tabValue = searches?.map(f => f.param).indexOf(queryParam) + 1;
  const handleChange = (event, newValue) => {
    if (newValue === 0) navigate(`/video/1`)  
    const s = searches[newValue - 1];
    navigate(`/search/${s.param}/1`)  
  };

  return (
    <Box className="App">
      <Box className="toolbar">
        <Flex sx={{ textAlign: 'left' }}>
          <Avatar sx={{ml: 4, mr: 2}} src="http://sploosh.me.uk/assets/sploosh.png" alt="logo" />
          {/* {JSON.stringify(searches)} */}
          <Spacer />
          <TextField  
           InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className={iconClass} />
                </InputAdornment>
              ),
            }}
            size="small"
            label="Search"
            placeholder="Enter search params"
            value={param}
            onKeyUp={(e) => e.keyCode === 13 && search()}
            onChange={(e) => setState('param', e.target.value)}
          />
        </Flex>
      </Box>

      <Collapse className="head" in={!!searches.length}>
        <Tabs onChange={handleChange} value={tabValue}>
          <Tab label="All Videos"/>
          {searches?.map (s => <Tab label={s.param} key={s.param} />)} 
        </Tabs>
      </Collapse>

      <VideoCollection {...args} />
    </Box>
  );

  
}
 

export default function App() {
  return <BrowserRouter>
  <Routes>
    <Route path="/" element={<VideoGrid />} />
    <Route path="/video/:videoPageNum" element={<VideoGrid />} />
    <Route path="/search/:queryParam/:videoPageNum" element={<VideoGrid />} />
  </Routes>
</BrowserRouter>
}


function useApp () {
  let navigate = useNavigate();
  const { videoPageNum = 1, queryParam } = useParams();
  const gridType = !queryParam ? 'video' : 'search';
  const { state, setState } = useComponentState({
    page: videoPageNum,
    param: queryParam,
    collectionType: gridType,
    busy: false, 
    searches: []
  });
  const { page, param, collectionType, searches, busy } = state;

  // React.useEffect(() => {
  //   !!queryParam && queryParam !== param && setState('param', queryParam)
  // }, [queryParam, param])

  const prefix = !queryParam ? '' : `/${queryParam}`
  const locate = (p) => {
    const tabs = searches.find (t => t.param === p)
      ? searches 
      : searches.concat({
        type: 'search',
        param: p
      })
    setState('param', p)
    setState('searches', tabs)
    navigate(`/search/${p}/1`) 
  };

  const search = () => {
    locate(param)
  };

  const args = {
    setBusy: b => setState('busy', b),
    collectionType: gridType,
    searchParam: queryParam,
    pageNum: parseInt(videoPageNum),
    onChange: locate,
    navigate
  };

  const SearchIcon = busy ? Sync : Search;
  const iconClass = busy ? 'spin' : '';
  return {
    SearchIcon,
    iconClass,
    search,
    setState,
    args,
    searches,
    navigate,
    queryParam,
    ...state
  }
}