import { useState } from "react";
import {
    CellFC,
    IWorkspaceContext,
    NewCellDataFn,
    workspaceCellSet,
    WorkspaceContext,
    WorkspaceData,
} from "../../workspace/Workspace";
import { Cell, CellBody, CellFooter, CellHeader } from "../Cell";
import ReactMarkdown from "react-markdown";
import React from "react";
import { Button } from "reactstrap";
import { RegistryEntry } from "../../workspace/CellRegistry";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";

export interface MarkdownNoteCellData {
    readonly text: string;
}

export const MarkdownNoteSlug = "markdown-note";
const placeholderText = "# New Note\n\nWrite your note here.";

export const newMarkdownNoteCell: NewCellDataFn<MarkdownNoteCellData> = (
    workspace: WorkspaceData
): MarkdownNoteCellData => {
    return {
        text: "",
    };
};

const Editor: React.FC<React.PropsWithChildren<{ value: string; setValue: (s: string) => void }>> = ({ value, setValue }) => {
    const handleChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
        setValue(event.currentTarget.value);
    };

    return <textarea className="form-control" onChange={handleChange} rows={10} value={value} />;
};

const Viewer: React.FC<React.PropsWithChildren<{ text: string }>> = ({ text }) => {
    return <ReactMarkdown children={text.length === 0 ? placeholderText : text} />;
};

export const MarkdownNote: CellFC<MarkdownNoteCellData> = ({ cell }) => {
    const data = cell.data;
    const [editing, setEditing] = useState(false);
    const { dispatch } = React.useContext<IWorkspaceContext>(WorkspaceContext);

    const setText = (text: string) => {
        workspaceCellSet(dispatch, cell.uuid, {
            ...cell.data,
            text,
        });
    };

    const inner = editing ? <Editor value={data.text} setValue={setText} /> : <Viewer text={data.text} />;

    const EditButton: React.FC<React.PropsWithChildren<unknown>> = () => {
        return (
            <Button onClick={() => setEditing(!editing)} active={editing}>
                <FontAwesomeIcon icon={faPenToSquare} />
            </Button>
        );
    };

    return (
        <Cell>
            <CellHeader buttons={[<EditButton key={0} />]} uuid={cell.uuid}></CellHeader>
            <CellBody>{inner}</CellBody>
            <CellFooter>
                <div>
                    {editing ? (
                        <a className="body-link" target="_other" href="https://www.markdownguide.org/cheat-sheet/">
                            Markdown syntax guide
                        </a>
                    ) : (
                        ""
                    )}
                </div>
            </CellFooter>
        </Cell>
    );
};

export const MarkdownNoteDefinition: RegistryEntry = {
    describe: (data: MarkdownNoteCellData) => "Note",
    component: MarkdownNote,
    launchers: [
        {
            title: "Note",
            newData: newMarkdownNoteCell,
        },
    ],
};
