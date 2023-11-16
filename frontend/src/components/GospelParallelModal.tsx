import React from "react";
import { Button, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useGetScriptureCatalogQuery } from "../api/api";
import { useAppDispatch, useAppSelector } from "../exegete/hooks";
import { ParallelSearch, ParallelSearchResult } from "../parallels/GospelParallels";
import { getParallelDatabase } from "../parallels/ParallelsCache";
import { ScriptureBookChapter } from "verseref";
import useInput from "../util/useInput";
import { makeNewCell } from "../workspace/Cell";
import Registry from "../workspace/CellRegistry";
import { selectWorkspace, workspaceCellAdd } from "../workspace/Workspace";
import { ScriptureCellColumn, ScriptureCellData, ScriptureSlug } from "./Cells/Scripture";

export const GospelParallelModal: React.FC<
    React.PropsWithChildren<{ setNewlyAdded: (v: boolean) => void; show: boolean; setShow: (v: boolean) => void }>
> = ({ show, setNewlyAdded, setShow }) => {
    const state = useAppSelector(selectWorkspace);
    const dispatch = useAppDispatch();
    const search = useInput("");
    const { data: catalog } = useGetScriptureCatalogQuery();
    const [selected, setSelected] = React.useState<undefined | string>();
    const [matches, setMatches] = React.useState<ParallelSearchResult>([]);
    const [options, setOptions] = React.useState<JSX.Element[]>([]);

    React.useEffect(() => {
        if (!catalog) {
            return;
        }
        // FIXME: NET hard-coded
        const shortcode = "NET";
        const module = catalog[shortcode];
        const db = getParallelDatabase(module, shortcode);
        const res = ParallelSearch(module, shortcode, db, search.value);
        setMatches(res);
        setOptions(
            res.map(([identifier, parallel], idx) => {
                return (
                    <option key={idx} value={identifier}>
                        {parallel.title}
                    </option>
                );
            }),
        );
    }, [catalog, search.value]);

    const cancel = () => {
        setShow(false);
    };

    const selectedEntry = matches.find(([identifier]) => identifier.toString() === selected);
    const canAdd: boolean = selected !== undefined && selectedEntry !== undefined;
    if (!canAdd && selected) {
        setSelected(undefined);
    }
    const describeSBC = (sbc: ScriptureBookChapter) => {
        return `${sbc.book} ${sbc.chapter_start}:${sbc.verse_start}-${sbc.chapter_end}:${sbc.verse_end}`;
    };
    const makeSC = (): ScriptureCellData | undefined => {
        if (!selectedEntry) {
            return undefined;
        }
        const [, , sbcs] = selectedEntry;
        const columns: ScriptureCellColumn[] = sbcs.map((sbc) => {
            return {
                shortcode: "NET",
                verseref: describeSBC(sbc),
                annotation: [],
                repAnnotation: [],
            };
        });
        return {
            hidemarkup: false,
            columns: columns,
            separateverses: true,
        };
    };

    const open = () => {
        const key = ScriptureSlug;
        const defn = Registry[key];
        const sc = makeSC();
        if (sc) {
            dispatch(workspaceCellAdd(makeNewCell(state.workspace!.data, ScriptureSlug, defn, sc)));
            setNewlyAdded(true);
        }
        setShow(false);
    };

    const describeSelected = () => {
        if (!selectedEntry) {
            return "";
        }
        const [, , sbcs] = selectedEntry;
        const entries = sbcs.map((sbc, i) => {
            return <li key={i}>{describeSBC(sbc)}</li>;
        });
        return <ul>{entries}</ul>;
    };
    const description = canAdd ? describeSelected() : "";

    return (
        <>
            <Modal autoFocus={false} toggle={() => setShow(!show)} isOpen={true}>
                <ModalHeader toggle={() => setShow(!show)}>Add Gospel Parallel</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Input
                            autoFocus={true}
                            type="text"
                            {...search}
                            placeholder="Verse reference or keyword"
                        ></Input>
                    </FormGroup>
                    <FormGroup>
                        <Input
                            value={selected}
                            onChange={(e) => setSelected(e.target.value)}
                            onClick={(e) => {
                                if (e.detail === 2) {
                                    // double click
                                    open();
                                }
                            }}
                            type="select"
                            size={10}
                        >
                            {options}
                        </Input>
                    </FormGroup>
                    <FormGroup>{description}</FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={open} disabled={!canAdd}>
                        Open
                    </Button>{" "}
                    <Button onClick={cancel}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    );
};
