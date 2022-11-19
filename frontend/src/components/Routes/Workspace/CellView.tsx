import React from "react";
import { useAppSelector } from "../../../exegete/hooks";
import Registry from "../../../workspace/CellRegistry";
import { selectWorkspaceCellListing } from "../../../workspace/Workspace";
import { RefsFC } from "./Types";
import Error from "../../Cells/Error";
import { ScrollWrapper } from "./ScrollWrapper";

export const CellView: RefsFC = ({ refs }) => {
    const cell_listing = useAppSelector(selectWorkspaceCellListing);

    if (!cell_listing) {
        return <></>;
    }

    const cells = cell_listing.map((cell, index) => {
        const inner = () => {
            for (var key in Registry) {
                if (key === cell.cell_type) {
                    return React.createElement(Registry[key].component, {
                        key: cell.uuid,
                        uuid: cell.uuid,
                    });
                }
            }

            return <Error key={cell.uuid} uuid={cell.uuid} />;
        };

        return (
            <ScrollWrapper key={cell.uuid} ref={(el) => (refs.current[index] = el)}>
                {inner()}
            </ScrollWrapper>
        );
    });

    return <div>{cells}</div>;
};
