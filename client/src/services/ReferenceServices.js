import { useAxiosHttp } from "../http/index"

export const ReferenceServices = () => {
    const { $api, error, clearError, loading, isAuthenticated } = useAxiosHttp();

    const getAllReferences = async () => {
        return await $api.get('/api/references/');
    };

    const getReferencesByType = async (type, parent_id) => {
        return await $api.post('/api/references/type', {type:type,parent_id:parent_id});
    };

    const createReference = async (reference) => {
        return await $api.post('/api/references/create', reference);
    };

    const updateReference = async (reference) => {
        return await $api.post('/api/references/update', reference);
    };

    const deleteReference = async (reference) => {
        return await $api.post('/api/references/delete', reference);
    };



    return {
        error, clearError, loading, isAuthenticated,
        getAllReferences, createReference, updateReference, deleteReference,
        getReferencesByType
    }
};