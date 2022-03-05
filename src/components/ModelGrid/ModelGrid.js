import React from 'react'; 
import { 
    getModels
} from '../../connector/DbConnector';
import useComponentState from '../../hooks/useComponentState';
import { ModelCard, Toolbar, StyledPagination } from '../';
import   { SplooshContext }  from '../../hooks/useSploosh';
import { Box } from '@mui/material';import {  
    useNavigate ,
    useParams
  } from "react-router-dom";

export default function ModelGrid ({ pageNum = 1 }) {
    const {state, setState} = useComponentState({
        page: 1,
        response: { }
    })
    const { page, response, busy } = state;
    const { videoPageNum = 1 } = useParams();
    const navigate = useNavigate()

    const {
        setState: setSplooshState, 
        showDialog
    } = React.useContext(SplooshContext);

    const loadModels = React.useCallback(
        async (p, f) => {
          if (busy) return;
          setState('busy', !0)
          setSplooshState('busy', !0)
          const items = await getModels(p);
          const searchKey$ =   `model-${p}`;
          console.log({ items });
          setSplooshState('busy', !1)
          setState('busy', !1)
          setState('response', { ...items, searchKey: searchKey$ });
          setState('page', p);
          setState('searchKey', searchKey$);
        },
        [page]
      );

    React.useEffect(() => {
      if (busy) return;
      const refresh = parseInt(videoPageNum) !== parseInt(page); 
      (refresh || !response.records) && loadModels(videoPageNum || 1);
    }, [videoPageNum, page, loadModels, response]);

    const handleChange = (event, value) => { 
        const href = `/model/${value}`
        navigate && navigate(href);
    };


    const { records, count } = response ?? {}
    if (!records) return <i />
    const totalPages = Math.ceil(count / 30);

    return (<>
    <Box className="App">
 

        <StyledPagination
            totalPages={totalPages}
            page={parseInt(videoPageNum)}
            handleChange={handleChange}
          />
 
        <div className="ModelGrid"> 
            {records.map(record => <ModelCard onClick={showDialog} key={record.ID} {...record} />)}
        </div>
    </Box>
    </>)
}