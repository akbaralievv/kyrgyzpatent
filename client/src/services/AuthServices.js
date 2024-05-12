import {useAxiosHttp} from "../http/index"
import {useContext} from "react";
import {AuthContext} from "../context/AuthContext";

export const  AuthServices = () => {
    const {$api, error, clearError, loading} = useAxiosHttp();  
    const auth = useContext(AuthContext);

    const login = async (login, password) => {
        const data = await $api.post('/api/users/login',{login, password});
        await auth.login(data);
       return  data
    };

    const logout = async () => {
        await auth.logout();
    };
    return {login,error, clearError, loading, logout}
};