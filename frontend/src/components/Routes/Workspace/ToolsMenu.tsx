import React from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { useAppDispatch, useAppSelector } from "../../../exegete/hooks";
import { makeNewCellFromLauncher } from "../../../workspace/Cell";
import Registry from "../../../workspace/CellRegistry";
import { selectWorkspace, workspaceCellAdd } from "../../../workspace/Workspace";

export const ToolsMenu: React.FC<
    React.PropsWithChildren<{
        setShowGospelParallelModal: React.Dispatch<React.SetStateAction<boolean>>;
        refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
    }>
> = ({ setShowGospelParallelModal, refs }) => {
    const state = useAppSelector(selectWorkspace);
    const dispatch = useAppDispatch();
    const cells = state.workspace ? state.workspace.data.cells : [];
    const [newlyAdded, setNewlyAdded] = React.useState(false);

    const items: JSX.Element[] = [];

    for (const key in Registry) {
        const defn = Registry[key];
        for (let i = 0; i < defn.launchers.length; i++) {
            const launcher = defn.launchers[i];
            const newCell = () => {
                dispatch(workspaceCellAdd(makeNewCellFromLauncher(state.workspace!.data, key, defn, launcher)));
                setNewlyAdded(true);
            };
            items.push(
                <DropdownItem key={`${key}.${i}`} onClick={newCell}>
                    Add {launcher.title}
                </DropdownItem>
            );
        }
    }

    const calcTargetY = (ref: HTMLDivElement) => {
        return ref.getBoundingClientRect().top + window.pageYOffset - 60; // bootstrap top menu
    };

    const scrollTo = (index: number) => {
        if (refs) {
            const ref = refs.current[index];
            if (ref) {
                window.scrollTo({ top: calcTargetY(ref), behavior: "smooth" });
            }
        }
    };

    React.useEffect(() => {
        if (newlyAdded) {
            for (let j = refs.current.length - 1; j >= 0; j--) {
                const ref = refs.current[j];
                if (ref) {
                    window.scrollTo({ top: calcTargetY(ref), behavior: "smooth" });
                    setNewlyAdded(false);
                    return;
                }
            }
        }
    }, [refs, newlyAdded]);

    const jumpItems = cells.map((cell, index) => {
        for (var key in Registry) {
            const entry = Registry[key];
            if (key === cell.cell_type) {
                return (
                    <DropdownItem key={`jmp${index}`} onClick={() => scrollTo(index)}>
                        #{index + 1} [{entry.describe(cell.data)}]
                    </DropdownItem>
                );
            }
        }
        return <></>;
    });

    return (
        <UncontrolledDropdown nav>
            <DropdownToggle caret nav>
                Tools
            </DropdownToggle>
            <DropdownMenu md-end={"true"} color="dark" dark>
                <DropdownItem key="h1" header>
                    Tools
                </DropdownItem>
                {items}
                <DropdownItem key="h2" header>
                    Databases
                </DropdownItem>
                <DropdownItem onClick={() => setShowGospelParallelModal(true)}>Gospel Parallel…</DropdownItem>
                {jumpItems.length > 0 ? (
                    <DropdownItem key="h3" header>
                        Jump to…
                    </DropdownItem>
                ) : (
                    <></>
                )}
                {jumpItems}
            </DropdownMenu>
        </UncontrolledDropdown>
    );
};
