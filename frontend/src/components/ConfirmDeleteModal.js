import Modal from './Modal';

function ConfirmDeleteModal({ title = 'Confirm delete', message, onCancel, onConfirm, loading }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={(
        <>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </>
      )}
    >
      <p>{message}</p>
    </Modal>
  );
}

export default ConfirmDeleteModal;
