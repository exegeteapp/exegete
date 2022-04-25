import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

export const ModuleButton: React.FC<{ shortcode: string }> = ({ shortcode }) => {
    const navigate = useNavigate();

    const goToModule = () => {
        navigate(`/module/${shortcode}`);
    };

    return (
        <Button size="sm" onClick={goToModule}>
            ({shortcode})
        </Button>
    );
};
