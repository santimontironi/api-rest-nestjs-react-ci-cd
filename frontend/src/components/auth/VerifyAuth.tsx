import { useNavigate } from "react-router-dom";
import { useMe } from "../../hooks/authHooks/useMe";
import Loader from "../ui/Loader";

const VerifyAuth = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();

    const { data: user, isLoading } = useMe();

    if (isLoading) {
        return <Loader />;
    }

    if(!user){
        navigate("/");
    }

    return children;
}

export default VerifyAuth