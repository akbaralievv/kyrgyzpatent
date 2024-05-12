import {useAxiosHttp} from "../http/index"

export const  UserServices = () => {
    const {$api, error, clearError, loading, isAuthenticated} = useAxiosHttp();

    const getAllUsers =  async () => {
       return  await $api.get('/api/users/');
    };

    const getCurrentUser =  async () => {
        return  await $api.get('/api/users/current');
    };

    const createUser = async (user) => {
        return  await $api.post('/api/users/create',user);
    };

    const updateUser = async (user) => {
        return  await $api.post('/api/users/update/user',user);
    };

    const changePassword = async (user) => {
        return  await $api.post('/api/users/update/password',user);
    };

    const changeCurrentPassword = async (user) => {
        return  await $api.post('/api/users/update/current_password',user);
    };

    return {error, clearError, loading,isAuthenticated,getAllUsers,createUser,updateUser,changePassword,getCurrentUser,changeCurrentPassword}
};