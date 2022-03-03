import * as React from 'react';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { Pagination } from '@mui/material';

import { getModel } from '../../connector/DbConnector';
import useComponentState from '../../hooks/useComponentState';
import { VideoCard } from '../';
import './ModelModal.css';

export default function ModelModal(props) {
  const { state, setState } = useComponentState({ page: 1, response: null });
  const { onClose, selectedId, open } = props;
  const { page, response } = state;

  const handleClose = () => {
    onClose(selectedId);
  };

  const loadModel = React.useCallback(async (id, p) => {
    const media = await getModel(id, p);
    console.log({ media });
    setState('response', media);
    setState('page', p);
  }, []);

  const handleChange = (event, value) => {
    loadModel(selectedId, value);
  };
  React.useEffect(() => {
    const oldId = response?.model?.[0].ID;
    const fresh = !response && !!selectedId;
    const renew = !!response && selectedId !== oldId;
    (fresh || renew) && !!selectedId && loadModel(selectedId, 1);
  }, [response, selectedId]);

  if (!response) return <i />;

  const { model: star, videos } = response;
  const totalPages = Math.ceil(videos.count / 30);
  const model = star[0];
  return (
    <Dialog
      classes={{ paper: 'model-modal' }}
      onClose={handleClose}
      open={open}
    >
      <DialogTitle>{model.name}</DialogTitle>
      <Pagination
        showFirstButton
        showLastButton
        shape="rounded"
        count={totalPages}
        page={page}
        onChange={handleChange}
      />
      <div className="ModelVideoGrid">
        {videos.records?.map((video) => (
          <VideoCard small key={video.ID} video={video} />
        ))}
      </div>
    </Dialog>
  );
}

export function useModelModal() {
  const [modelModalState, setState] = React.useState({ open: false });

  const showDialog = (selectedId) => {
    setState({
      open: true,
      selectedId,
      onClose: () => setState({ open: false }),
    });
  };

  return { modelModalState, showDialog };
}
