import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useAppDispatch, useAppSelector } from "../../../exegete/hooks";
import useInput from "../../../util/useInput";
import { selectWorkspaceTitle, workspaceSetTitle } from "../../../workspace/Workspace";

export const RenameWorkspaceModal: React.FC<
    React.PropsWithChildren<{ show: boolean; setShow: (v: boolean) => void }>
> = ({ show, setShow }) => {
    const title = useAppSelector(selectWorkspaceTitle);
    const dispatch = useAppDispatch();
    const newTitle = useInput(title || "");

    const cancel = () => {
        setShow(false);
    };
    const save = () => {
        dispatch(workspaceSetTitle(newTitle.value));
        setShow(false);
    };

    return (
        <>
            <Modal autoFocus={false} toggle={() => setShow(!show)} isOpen={true}>
                <ModalHeader toggle={() => setShow(!show)}>Rename Workspace</ModalHeader>
                <ModalBody>
                    <Input autoFocus={true} type="text" {...newTitle}></Input>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={save}>
                        Set title
                    </Button>{" "}
                    <Button onClick={cancel}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    );
};
