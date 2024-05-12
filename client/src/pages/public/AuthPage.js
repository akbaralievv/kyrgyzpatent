import React, { useState, useEffect, useRef } from 'react'
import { AuthServices } from "../../services/AuthServices"

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Password } from "primereact/password";

import { useTranslation } from 'react-i18next';

export const AuthPage = () => {
    const toast = useRef(null);
    const { t } = useTranslation();
    const [form, setForm] = useState({
        login: '', password: ''
    });

    const { login, error, clearError, loading } = AuthServices();

    useEffect(() => {
        if (error) {
            toast.current.show({ severity: 'error', summary: t('error'), detail: error, life: 3000 });
            clearError();
        }
    }, [error, clearError]);

    const loginHandler = async () => {
        try {
            await login(form.login, form.password);
        } catch (e) {
        }
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _user = { ...form };
        _user[`${name}`] = val;
        setForm(_user);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            loginHandler()
        }
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <div style={{ whiteSpace: 'pre-line' }}>
                        <Toast ref={toast} />
                    </div>
                    <div className="p-col-12 p-mt-6">
                        <h3 className="p-text-center p-text-xl-center">{t('authorization')}</h3>
                        <div className="p-col-12 p-d-flex p-jc-center">
                            <Toast ref={toast} />
                            <div className="p-fluid">
                                <div className="p-d-flex p-flex-column" style={{ height: '160px' }}>
                                    <div className="p-field">
                                        <label htmlFor="login">
                                            {t('login')}*
                                        </label>
                                        <InputText
                                            id="login"
                                            value={form.login}
                                            onChange={(e) => onInputChange(e, 'login')}
                                            required
                                            autoFocus
                                            onKeyDown={handleKeyDown}
                                        />
                                    </div>
                                    <div className="p-field">
                                        <label htmlFor="password">
                                            {t('password')}*
                                        </label>
                                        <Password
                                            id="password"
                                            value={form.password}
                                            onChange={(e) => onInputChange(e, 'password')}
                                            feedback={false}
                                            autoComplete="on"
                                            toggleMask
                                            required
                                            onKeyDown={handleKeyDown}
                                        />
                                    </div>
                                    <div className="p-mt-auto">
                                        <Button className="p-text-center"
                                            onClick={loginHandler}
                                            disabled={loading}
                                            label={t('sign_in')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};