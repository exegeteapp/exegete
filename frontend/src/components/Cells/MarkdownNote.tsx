import { useState } from "react";
import { CellFC, NewCellDataFn, WorkspaceData } from "../../workspace/Workspace";
import { Cell, CellBody, CellFooter, CellHeader } from "../Cell";
import ReactMarkdown from "react-markdown";
import { Button } from "reactstrap";
import { RegistryEntry } from "../../workspace/CellRegistry";

export interface MarkdownNoteCellData {
    text: string;
}

export const MarkdownNoteSlug = "markdown-note";

export const newMarkdownNoteCell: NewCellDataFn<MarkdownNoteCellData> = (
    workspace: WorkspaceData
): MarkdownNoteCellData => {
    return {
        text: "# New Note\n\nWrite your note here.",
    };
};

const Editor: React.FC<{ value: string; setValue: (s: string) => void }> = ({ value, setValue }) => {
    const handleChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
        setValue(event.currentTarget.value);
    };

    return <textarea className="form-control" onChange={handleChange} rows={10} value={value} />;
};

const Viewer: React.FC<{ text: string }> = ({ text }) => {
    return <ReactMarkdown children={text} />;
};

export const MarkdownNote: CellFC<MarkdownNoteCellData> = ({ cell, functions }) => {
    const data = cell.data;
    const [editing, setEditing] = useState(false);

    const setText = (text: string) => {
        functions.set({
            ...cell.data,
            text,
        });
    };

    const inner = editing ? <Editor value={data.text} setValue={setText} /> : <Viewer text={data.text} />;

    return (
        <Cell>
            <CellHeader functions={functions} uuid={cell.uuid}></CellHeader>
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
                    <Button className="float-end" onClick={() => setEditing(!editing)}>
                        {editing ? "Done" : "Edit"}
                    </Button>
                </div>
            </CellFooter>
        </Cell>
    );
};

export const MarkdownNoteDefinition: RegistryEntry = {
    component: MarkdownNote,
    launchers: [
        {
            title: "Note",
            newData: newMarkdownNoteCell,
        },
    ],
};
