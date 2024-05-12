import { useAxiosHttp } from "../http/index"

export const PublicServices = () => {
    const { $api, error, clearError, loading, token } = useAxiosHttp();

   
    return {
        error, clearError, loading, token
    }

};