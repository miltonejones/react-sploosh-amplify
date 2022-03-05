import React from 'react';
import { Search, Sync } from '@mui/icons-material';
import useComponentState from './useComponentState';
import {  
    useNavigate ,
    useParams
  } from "react-router-dom";
import { useModelModal} from '../components'

export const SplooshContext = React.createContext()


export default function useSploosh ({ queryType, pageIndex }) {
    let navigate = useNavigate();
    const { videoPageNum = 1, queryParam } = useParams();
    const gridType = !queryParam ? 'video' : 'search';
    const { state, setState } = useComponentState({
      page: videoPageNum,
      param: queryParam,
      collectionType: queryType || gridType,
      busy: false, 
      searches: []
    });
    const { page, param, collectionType, searches, busy } = state;
    const { modelModalState, showDialog } = useModelModal();
  
    const prefix = !queryParam ? '' : `/${queryParam}`
    const removeTab = (p) => {
      const tabs = searches.filter (t => t.param !== p) 
      setState('param', null)
      setState('searches', tabs)
      navigate(`/`) 
    };
  
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
      showDialog,
      ...state
    }
  }

