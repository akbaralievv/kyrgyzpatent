import  {createContext} from 'react'

function noop() {}

export const AuthContext = createContext({
    accessToken:null,
    userId:null,
    login: noop,
    logout:noop,
    isAuthenticated:false
});