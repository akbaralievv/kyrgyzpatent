import { useAxiosHttp } from "../http/index"

export const KnowledgeServices = () => {
    const { $api, error, clearError, loading, token, isAuthenticated } = useAxiosHttp();

    const getAllKnowledges = async () => {
        return await $api.get('/api/knowledges/');
    };

    const getAllKnowledgesByParam = async (param) => {
        return await $api.post('/api/knowledges/search',param);
    };

    const createKnowledge = async (knowledge) => {
        return await $api.post('/api/knowledges/create', knowledge);
    };

    const updateKnowledge = async (knowledge) => {
        return await $api.post('/api/knowledges/update', knowledge);
    };

    const deleteKnowledge = async (knowledge) => {
        return await $api.post('/api/knowledges/delete', knowledge);
    };


    const uploadVideo = async (formData, knowledge_id) => {
        return await $api.post('/api/knowledges/upload/video/'+knowledge_id, formData);
    };
    const deleteVideo = async (file) => {
        return await $api.post('/api/knowledges/delete/video/', file);
    };

    return {
        error, clearError, loading, isAuthenticated, token, 
        getAllKnowledges, createKnowledge, updateKnowledge, deleteKnowledge,getAllKnowledgesByParam
        ,uploadVideo,deleteVideo
    }
};