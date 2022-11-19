import { useNavigate } from "react-router-dom";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useAppDispatch } from "../../../exegete/hooks";
import { DeleteWorkspace } from "../../../workspace/Workspace";

export const DeleteWorkspaceModal: React.FC<
    React.PropsWithChildren<{ show: boolean; setShow: (v: boolean) => void }>
> = ({ show, setShow }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const cancel = () => {
        setShow(false);
    };

    const apply = () => {
        const doDelete = async () => {
            await dispatch(DeleteWorkspace());
            setShow(false);
            navigate(`/`);
        };
        doDelete();
    };

    return (
        <>
            <Modal toggle={() => setShow(!show)} isOpen={true}>
                <ModalHeader toggle={() => setShow(!show)}>Delete Workspace?</ModalHeader>
                <ModalBody>Do you really want to delete this workspace? This cannot be undone.</ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={apply}>
                        Delete
                    </Button>
                    <Button onClick={cancel}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    );
};
