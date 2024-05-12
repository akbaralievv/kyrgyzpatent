import {useState, useCallback, useEffect} from 'react'

const storageName = 'userData';

export const useAuth = () => {
    const [token, setToken] = useState(null);
    const [ready, setReady] = useState(false);
    const [userId, setUserId] = useState(null);
   

    const login = useCallback((userData) => {
        setToken(userData.accessToken);
        setUserId(userData.user.id);
        localStorage.setItem(storageName, JSON.stringify({
            userId:userData.user.id, token:userData.accessToken
        }))
    },[]);

    const logout = useCallback(() => {
        setToken(null);
        setUserId(null);
        localStorage.removeItem(storageName)
    },[]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem(storageName));
        if(data && data.token && data.userId) {
            const userData = {
                accessToken: data.token,
                user: {
                    id: data.userId
                }
            };
            login(userData)
        }
        setReady(true)
    }, [login]);

    return {login, logout, token, userId, ready}
};