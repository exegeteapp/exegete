import { useAppDispatch } from "../exegete/hooks";
import { UserBootstrap } from "../user/User";

export const UserProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
    const dispatch = useAppDispatch();

    dispatch(UserBootstrap());

    return <div>{children}</div>;
};
