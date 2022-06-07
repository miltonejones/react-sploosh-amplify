import React from 'react';
import { Search, Sync } from '@mui/icons-material';
import useComponentState from './useComponentState';
import {  
    useNavigate ,
    useParams
  } from "react-router-dom";
import { useModelModal} from '../components'
import useModelStorage from './useModalStorage';
import dynamoStorage from '../services/DynamoStorage';
 

export const SplooshContext = React.createContext()


export default function useSploosh ({ queryType, pageIndex }) {
  const store = dynamoStorage();

    let navigate = useNavigate();
    const { videoPageNum = 1, queryParam } = useParams();
    const gridType = !queryParam ? 'video' : 'search';
    const { state, setState } = useComponentState({
      page: videoPageNum,
      param: queryParam,
      collectionType: queryType || gridType,
      busy: false, 
      searches: [],
      editMode: false,
      selectedVideos: [],
      candidateVideos: []
    });
    const { page, param, collectionType, searches, busy, search_check, selectedVideos, candidateVideos, editMode } = state;
    const { modelModalState, showDialog } = useModelModal();

    React.useEffect(() => {
      !searches?.length && !search_check && (async () => {
        const tabs = await store.getItem('search-tabs'); 
        setState('search_check', !0)
        setState('searches', !tabs ? [] : JSON.parse(tabs)) 
      })();
    }, [searches, search_check]);

    

    const selectVideo = (video) => {
      const videos = editMode ? candidateVideos : selectedVideos;
      const existing = videos || [];
      const updated = existing.some(f => f.ID === video.ID)
        ? existing.filter(f => f.ID !== video.ID)
        : existing.concat(video); 
      setState(editMode ? 'candidateVideos' : 'selectedVideos', updated); 
    };
    
  
    const prefix = !queryParam ? '' : `/${queryParam}`
    const removeTab = (p, selectedTab) => {
      const tabs = searches.filter (t => t.param !== p) 
      setState('param', null)
      setState('searches', tabs) 
      store.setItem('search-tabs', JSON.stringify(tabs));
      !!selectedTab && navigate(`/video/1`) ;
    };
  
    const locate = (p) => {
      const raw = p.replace('*', '');
      const tabs = searches.find (t => t.param === raw)
        ? searches 
        : searches.concat({
          type: 'search',
          param: raw
        })
      setState('param', p)
      setState('searches', tabs)
      store.setItem('search-tabs', JSON.stringify(tabs));
      navigate(`/search/${p}/1`) 
    };
  
    const search = () => {
      locate(param)
    };
  
    const args = {
      setBusy: b => setState('busy', b),
      collectionType: queryType || gridType,
      searchParam: queryParam,
      pageNum: parseInt(videoPageNum),
      onChange: locate,
      navigate
    };
  
    const SearchIcon = busy ? Sync : Search;
    const iconClass = busy ? 'spin' : '';
    const pageNames = [
      {label:'videos',href:'/'}, 
      {label:'favorites',href:'/heart/1'}, 
      {label:'recently seen',href:'/recent/1'}, 
      {label:'models',href:'/model/1'}, 
     ]
    return {
      SearchIcon,
      iconClass,
      search,
      setState,
      args,
      searches,
      navigate,
      queryParam,
      removeTab,
      locate,
      pageNames,
      pageIndex,
      modelModalState, 
      selectVideo,
      candidateVideos,
      editMode,
      selectedVideos,
      showDialog,
      ...state
    }
  }

