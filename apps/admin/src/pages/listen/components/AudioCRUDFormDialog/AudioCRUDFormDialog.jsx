import AudioCRUDForm from "./AudioCRUDForm";
import CRUDDialog from "../../../../components/@crud-dialog/CRUDDialog";

const AudioCRUDFormDialog = (props) => {
  const { open, onClose, onConfirm, onDelete, isCreate, data } = props;

  return (
    <CRUDDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm(isCreate)}
      onDelete={onDelete}
      isCreate={isCreate}
      data={data}
      FormComponent={AudioCRUDForm}
    />
  );
};

export default AudioCRUDFormDialog;
