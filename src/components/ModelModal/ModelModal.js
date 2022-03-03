import * as React from 'react';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { getModel } from '../../connector/DbConnector';
import useComponentState from '../../hooks/useComponentState';
import { VideoCard, StyledPagination, Flex } from '../';
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
  if (!videos) return 'No videos found for this artist.';
  const totalPages = Math.ceil(videos.count / 30);
  const model = star[0];
  return (
    <Dialog
      classes={{ paper: 'model-modal' }}
      onClose={handleClose}
      open={open}
    >
      <DialogTitle>
        <Flex mr={2}>
          {!!model.image && <Avatar src={model.image} alt={model.name} />}
          <Stack ml={2}>
            <Typography variant="body1">{model.name}</Typography>
            <Typography variant="caption">{videos.count} videos</Typography>
          </Stack>
        </Flex>
      </DialogTitle>
      <StyledPagination
        totalPages={totalPages}
        page={page}
        handleChange={handleChange}
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
