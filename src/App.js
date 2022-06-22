import React from 'react';
import './style.css';
import { SearchPersistService } from './services/SearchPersist';
import useComponentState from './hooks/useComponentState';
import InputAdornment from '@mui/material/InputAdornment';
import {Tabs, Flex, VideoCollection, ModelGrid, SearchDrawer, 
    Toolbar, ModelModal } from './components'; 
import { Box , Tab, Collapse, IconButton } from '@mui/material';
import { Close, Save, Favorite , Shop} from '@mui/icons-material';
import { 
  BrowserRouter,  
  Routes, 
  Route
} from "react-router-dom";
import useSploosh, { SplooshContext } from './hooks/useSploosh';
import  { getModelsByName } from './connector/DbConnector';
import { VideoDrawer } from './components';
import ShoppingDrawer from './components/ShoppingDrawer/ShoppingDrawer';
import Dash from './components/Dash/Dash';

function VideoGrid ({tag, ...props}) {
  const sploosh = useSploosh(props);
  const {  
    search,
    param,
    setState,
    args,
    navigate,
    queryParam,
    searches,
    locate, 
    collectionType,
    searchDrawerOpen,
    videoDrawerOpen,
    videoDrawerData,
    modelModalState, 
    pageIndex,
    loaded,
    removeTab 
  } = sploosh;
  const rawParam = queryParam?.replace('*', '')
  const tabValue = searches?.map(f => f.param).indexOf(rawParam) + 1;
 
  const handleChange = (event, newValue) => {
    if (newValue === 0) navigate(`/video/1`)   
    const s = searches[newValue - 1];
    navigate(`/${s.type}/${s.param}/1`)  
  };

  const Tag = tag || VideoCollection;
  const Component = pageIndex < 3 ? Tag : ModelGrid;

  React.useEffect(() => { 
    if (loaded) return; 
    setState(s =>  ({...s, loaded: 1}))
  }, [loaded])

  // adding token change

  return (
    <SplooshContext.Provider value={{ ...sploosh }}>
      <Box className="App">

        {/* toolbar */}
        <Toolbar viewIndex={pageIndex} videoDrawerOpen={videoDrawerOpen} setOpen={() => { 
          setState('videoDrawerOpen', !videoDrawerOpen)
        }} />
   
        {/* search tabs */}
        <Collapse className="head" in={!!searches.length}>
         <Flex spaced fullWidth>

          
          {collectionType === 'video' &&  <Tabs onChange={handleChange} 
            removeTab={removeTab} 
            value={tabValue} 
            sx={{mt: 0.5}}
            items={["All Videos"].concat(searches?.map(s => s.param))}
            />}
        

            {!!queryParam && <>
              <Save onClick={async () => {
                const value = searches[tabValue - 1]; 
                await SearchPersistService.saveSearch(value.param)
                alert (`Search ${value.param} was saved`)
              }} />

                <Favorite sx={{ml: 2, color: queryParam?.indexOf('*') > 0 ? 'red' : 'black'}} onClick={async () => {
                  const value = searches[tabValue - 1]; 
                  const heart = queryParam.indexOf('*') > 0 
                    ? rawParam
                    : queryParam + '*';
                  locate(heart);
                }} />
            </>}
          

         </Flex>
        </Collapse>
    
    
        {/* video grid */}
        <Component {...args} /> 

        <ModelModal {...modelModalState} /> 

        <ShoppingDrawer
          videoDrawerData={videoDrawerData}
          onClose={() => {
            setState('videoDrawerOpen', false);
            setState('videoDrawerData', null)
          }} 
          open={videoDrawerOpen}
        />

        {/* search drawer */}
        <SearchDrawer 
          onClick={locate} 
          onClose={() => setState('searchDrawerOpen', false)} 
          open={searchDrawerOpen} />
      </Box>
    </SplooshContext.Provider>
  );
}
 

export default function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<VideoGrid pageIndex={-1} tag={Dash} queryType="dash"  />} />
      <Route path="/model/:videoPageNum" element={<VideoGrid pageIndex={3} queryType="model"  />} />
      <Route path="/recent/:videoPageNum" element={<VideoGrid pageIndex={2} queryType="recent" />} />
      <Route path="/heart/:videoPageNum" element={<VideoGrid pageIndex={1} queryType="heart" />} />
      <Route path="/video/:videoPageNum" element={<VideoGrid pageIndex={0} />} />
      <Route path="/search/:queryParam/:videoPageNum" element={<VideoGrid pageIndex={0} />} />
      <Route path="/domain/:queryParam/:videoPageNum" element={<VideoGrid pageIndex={0} queryType="domain"/>} />
    </Routes>
</BrowserRouter>
}

 