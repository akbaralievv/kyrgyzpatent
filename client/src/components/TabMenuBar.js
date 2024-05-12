import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { useHistory, Link } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';
import { classNames } from 'primereact/utils';

import { UserServices } from '../services/UserServices';
import { AuthServices } from '../services/AuthServices';

import { useTranslation } from 'react-i18next';

export const TabMenuBar = (props) => {
  const { error, clearError, loading, isAuthenticated, changeCurrentPassword, getCurrentUser } =
    UserServices();
  const { logout } = AuthServices();

  const emptyUser = {
    login: '',
    password: '',
    passwordRepeat: '',
    currentPassword: '',
    surname: '',
    name: '',
  };

  const [userItems, setUserItems] = useState([]);
  const [user, setUser] = useState({ emptyUser });

  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useRef(null);
  const menu = useRef(null);
  const langMenu = useRef(null);
  const history = useHistory();

  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    window.location.reload(false);
  };

  const userState = [
    {
      label: t('change_password'),
      visible: false,
      icon: 'pi pi-fw pi-key',
      command: () => {
        changePasswordUser(user);
      },
    },
    {
      label: t('sign_out'),
      visible: false,
      icon: 'pi pi-fw pi-sign-out',
      command: () => {
        logoutHandler();
      },
    },
  ];

  useEffect(() => {
    document.title = t('title');
  }, [i18n.language]);

  useEffect(() => {
    if (error) {
      toast.current.show({
        severity: 'error',
        summary: t('error'),
        detail: error,
        life: 3000,
        whiteSpace: 'pre-line',
      });
      clearError();
    }
  }, [error, clearError]);

  const fetch = useCallback(async () => {
    try {
      const fetched = await getCurrentUser();
      setUserItems(userState);
      setUser(fetched);
    } catch (e) {}
  }, []);
  useEffect(() => {
    if (isAuthenticated) {
      fetch();
    }
  }, [isAuthenticated]);

  const logoutHandler = () => {
    logout();
    history.push('/');
  };

  const changePasswordUser = () => {
    setChangePasswordDialog(true);
  };
  const hideDialog = () => {
    setSubmitted(false);
    setChangePasswordDialog(false);
  };

  const saveChangePassword = async () => {
    try {
      setSubmitted(true);
      if (user.password.trim() && user.passwordRepeat.trim()) {
        if (user.password === user.passwordRepeat) {
          let _user = { ...user };
          if (user.id) {
            const data = await changeCurrentPassword(_user);
            toast.current.show({
              severity: 'success',
              summary: t('success'),
              detail: data.message,
              life: 3000,
            });
          } else {
            toast.current.show({
              severity: 'error',
              life: 3000,
              summary: t('error'),
              detail: t('user_not_selected'),
            });
          }
          setChangePasswordDialog(false);
        } else {
          toast.current.show({
            severity: 'error',
            life: 3000,
            summary: t('error'),
            detail: t('passwords_not_match'),
          });
        }
      }
    } catch (e) {}
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _user = { ...user };
    _user[`${name}`] = val;
    setUser(_user);
  };

  const langState = [
    {
      label: 'Русский',
      icon: 'fi fi-ru',
      command: () => {
        changeLanguage('ru');
      },
    },
    {
      label: 'English',
      icon: 'fi fi-gb',
      command: () => {
        changeLanguage('gb');
      },
    },
    {
      label: 'Кыргызча',
      icon: 'fi fi-kg',
      command: () => {
        changeLanguage('kg');
      },
    },
  ];

  const changePasswordFooter = (
    <React.Fragment>
      <Button
        label={t('cancel')}
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDialog}
        disabled={loading}
      />
      <Button
        label={t('save')}
        icon="pi pi-check"
        className="p-button-text"
        onClick={saveChangePassword}
        disabled={loading}
      />
    </React.Fragment>
  );

  const changePasswordTemplate = (
    <React.Fragment>
      <div className="p-field">
        <label htmlFor="currentPassword">{t('current_password')}</label>
        <Password
          id="currentPassword"
          name="currentPassword"
          value={user.currentPassword}
          onChange={(e) => onInputChange(e, 'currentPassword')}
          feedback={false}
          type="password"
          toggleMask
          required
          className={classNames({ 'p-invalid': submitted && !user.currentPassword })}
        />
        {submitted && !user.currentPassword && (
          <small className="p-error">{t('this_value_is_required')}</small>
        )}
      </div>

      <div className="p-field">
        <label htmlFor="password">{t('enter_password')}</label>
        <Password
          id="password"
          name="password"
          value={user.password}
          onChange={(e) => onInputChange(e, 'password')}
          feedback={false}
          type="password"
          toggleMask
          required
          className={classNames({ 'p-invalid': submitted && !user.password })}
        />
        {submitted && !user.password && (
          <small className="p-error">{t('this_value_is_required')}</small>
        )}
      </div>
      <div className="p-field">
        <label htmlFor="passwordRepeat">{t('re_enter_password')}</label>
        <Password
          id="passwordRepeat"
          name="passwordRepeat"
          value={user.passwordRepeat}
          type="password"
          onChange={(e) => onInputChange(e, 'passwordRepeat')}
          feedback={false}
          toggleMask
          required
          className={classNames({ 'p-invalid': submitted && !user.passwordRepeat })}
        />
        {submitted && !user.passwordRepeat && (
          <small className="p-error">{t('this_value_is_required')}</small>
        )}
      </div>
    </React.Fragment>
  );

  return (
    <div className="layout-topbar">
      <div style={{ whiteSpace: 'pre-line' }}>
        <Toast ref={toast} />
      </div>
      <Link to="/" className="layout-topbar-logo">
        <img src={'/Logo.png'} alt="logo" />
        <span>{t('name')}</span>
      </Link>

      <button
        type="button"
        className="p-link  layout-menu-button layout-topbar-button"
        onClick={props.onToggleMenuClick}>
        <i className="pi pi-bars" />
      </button>

      <button
        type="button"
        className="p-link layout-topbar-menu-button layout-topbar-button"
        onClick={props.onMobileTopbarMenuClick}>
        <i className="pi pi-ellipsis-v" />
      </button>

      <ul
        className={classNames('layout-topbar-menu lg:flex origin-top', {
          'layout-topbar-menu-mobile-active': props.mobileTopbarMenuActive,
        })}>
        <li>
          <Menu model={langState} popup ref={langMenu} id="popup_menu_lang" />
          <Button
            label={
              i18n.language === 'ru' ? 'Русский' : i18n.language === 'kg' ? 'Кыргызча' : 'English'
            }
            icon={`fi fi-${i18n.language}`}
            className="p-button-text p-button-plain"
            onClick={(event) => langMenu.current.toggle(event)}
            aria-controls="popup_menu"
            aria-haspopup
          />
        </li>
        <li>
          {!isAuthenticated && (
            <div className="p-mb-2 p-mr-2">
              <Button
                label={t('sign_in')}
                icon="pi pi-user"
                className="p-button-text p-button-plain"
                onClick={(event) => history.push('/login')}
                aria-controls="popup_menu"
                aria-haspopup
              />
            </div>
          )}
          {isAuthenticated && (
            <div className="p-mb-2 p-mr-2">
              <Menu model={userItems} popup ref={menu} id="popup_menu" />
              <Button
                label={user.first_name + ' ' + user.last_name}
                icon="pi pi-user"
                className="p-button-text p-button-plain"
                onClick={(event) => menu.current.toggle(event)}
                aria-controls="popup_menu"
                aria-haspopup></Button>
            </div>
          )}
        </li>
      </ul>
      <Dialog
        visible={changePasswordDialog}
        style={{ width: '450px' }}
        header={t('user_edit') + ' : ' + user.login}
        modal
        className="p-fluid"
        footer={changePasswordFooter}
        onHide={hideDialog}>
        {changePasswordTemplate}
      </Dialog>
    </div>
  );
};
