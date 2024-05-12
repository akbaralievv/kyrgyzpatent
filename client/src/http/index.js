import { useCallback, useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from 'react-i18next';

const axios = require('axios').default;
const env = process.env.REACT_APP_ENV || 'development';
const config = require('../config/config.json')[env];

export const useAxiosHttp = () => {

    const { t } = useTranslation();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { token, isAuthenticated } = useContext(AuthContext);
    const storageName = 'userData';
    const auth = useContext(AuthContext);
    

    const $api = axios.create({
        baseURL: config.baseURL,
        withCredentials: false
    });

    $api.interceptors.request.use((config) => {
        const data = JSON.parse(localStorage.getItem(storageName));
        if (data && data.token) {
            config.headers.Authorization = `Bearer ${data.token}`;
        }
        return config;
    });

    $api.interceptors.response.use((config) => {
        return config.data;
    }, async (err) => {
        setLoading(true);
        try {
            if (err && err.response && err.response.status && err.response.status === 401 && err.config && !err.config._isRetry) {
                await auth.logout();
            }

            if (err && err.response && err.response.status && err.response.status === 400 && err.response.data && err.response.data.errors && err.response.data.errors.length > 0) {
                let msg = '';
                for (var i = 0; i < err.response.data.errors.length; i++) {
                    msg += [i + 1] + '. ' + t(err.response.data.errors[i].msg) + '\n'
                }
                throw new Error(msg || t('something_went_wrong'))
            }
            setLoading(false);
            throw new Error(err.response.data.message || t('something_went_wrong'))
        } catch (e) {
            setLoading(false);
            setError(e.message);
            throw new Error(e || t('something_went_wrong'))
        }
    });

    const clearError = useCallback(() => setError(null), []);
    return { $api, error, clearError, setError, loading, token, isAuthenticated }
};




