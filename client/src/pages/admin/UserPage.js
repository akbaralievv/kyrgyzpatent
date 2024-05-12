import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UserServices } from '../../services/UserServices';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Checkbox } from 'primereact/checkbox';
import { Toolbar } from 'primereact/toolbar';

import { useTranslation } from 'react-i18next';

export const UserPage = () => {
  const { t } = useTranslation();
  const { error, clearError, loading, getAllUsers, createUser, updateUser, changePassword } =
    UserServices();

  const emptyUser = {
    login: '',
    password: '',
    passwordRepeat: '',
    first_name: '',
    enabled: false,
    last_name: '',
    updatedAt: null,
    createdAt: null,
  };

  const [users, setUsers] = useState(null);
  const [userDialog, setUserDialog] = useState(false);
  const [userEditDialog, setUserEditDialog] = useState(false);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [user, setUser] = useState(emptyUser);
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState(null);
  const toast = useRef(null);
  const dt = useRef(null);

  const fetchUsers = useCallback(async () => {
    try {
      const fetched = await getAllUsers();
      setUsers(fetched);
    } catch (e) {}
  }, []);

  const openNew = () => {
    setUser(emptyUser);
    setSubmitted(false);
    setUserDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setUserDialog(false);
    setUserEditDialog(false);
    setChangePasswordDialog(false);
  };

  const editUser = (user) => {
    setUser({ ...user });
    setUserEditDialog(true);
  };

  const changePasswordUser = (user) => {
    setUser({ ...user });
    setChangePasswordDialog(true);
  };

  const saveUser = async () => {
    try {
      setSubmitted(true);
      if (
        user.login.trim() &&
        user.password.trim() &&
        user.passwordRepeat.trim() &&
        user.last_name.trim() &&
        user.first_name.trim()
      ) {
        if (user.password === user.passwordRepeat) {
          let _users = [...users];
          let _user = { ...user };
          const data = await createUser(_user);
          await _users.push(data.user);
          toast.current.show({
            severity: 'success',
            summary: t('success'),
            detail: data.message,
            life: 3000,
          });
          await setUsers(_users);
          setUserDialog(false);
          setUser(emptyUser);
        } else {
          toast.current.show({
            severity: 'error',
            life: 3000,
            summary: t('error'),
            detail: t('passwords_not_match'),
          });
        }
      }
    } catch (e) {
      toast.current.show({ severity: 'error', summary: t('error'), detail: e, life: 3000 });
    }
  };

  const saveEditUser = async () => {
    try {
      setSubmitted(true);
      if (user.login.trim() && user.last_name.trim() && user.first_name.trim()) {
        let _users = [...users];
        let _user = { ...user };
        if (user.id) {
          const index = findIndexById(user.id);
          const data = await updateUser(_user);
          _users[index] = data.user;
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
        setUsers(_users);
        setUserEditDialog(false);
        setUser(emptyUser);
      }
    } catch (e) {
      toast.current.show({ severity: 'error', summary: t('error'), detail: e, life: 3000 });
    }
  };

  const saveChangePassword = async () => {
    try {
      setSubmitted(true);
      if (user.password.trim() && user.passwordRepeat.trim()) {
        if (user.password === user.passwordRepeat) {
          let _users = [...users];
          let _user = { ...user };
          if (user.id) {
            const index = findIndexById(user.id);
            const data = await changePassword(_user);
            _users[index] = data.user;
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
          setUsers(_users);
          setChangePasswordDialog(false);
          setUser(emptyUser);
        } else {
          toast.current.show({
            severity: 'error',
            life: 3000,
            summary: t('error'),
            detail: t('passwords_not_match'),
          });
        }
      }
    } catch (e) {
      toast.current.show({ severity: 'error', summary: t('error'), detail: e, life: 3000 });
    }
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _user = { ...user };
    _user[`${name}`] = val;
    setUser(_user);
  };

  const onInputBooleanChange = (e, name) => {
    const val = e.checked || false;
    let _user = { ...user };
    _user[`${name}`] = val;
    setUser(_user);
  };

  const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === id) {
        index = i;
        break;
      }
    }
    return index;
  };

  const rowIndexTemplate = (rowData, column) => {
    return column.rowIndex + 1 + '';
  };

  const enabledText = (rowData) => {
    return rowData.enabled ? t('active') : t('blocked');
  };

  const createdAtText = (rowData) => {
    return rowData.createdAt ? new Date(rowData.createdAt).toLocaleString() : '';
  };

  const updateAtText = (rowData) => {
    return rowData.updatedAt ? new Date(rowData.updatedAt).toLocaleString() : '';
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (error) {
      toast.current.show({ severity: 'error', summary: t('error'), detail: t(error), life: 3000 });
      clearError();
    }
  }, [error, clearError]);

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded  p-mr-2"
          onClick={() => editUser(rowData)}
          disabled={loading}
        />
        <Button
          icon="pi pi-key"
          className="p-button-rounded p-mr-2"
          onClick={() => changePasswordUser(rowData)}
          disabled={loading}
        />
      </React.Fragment>
    );
  };

  const changePasswordTemplate = (
    <React.Fragment>
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

  const userParamTemplate = (
    <React.Fragment>
      <div className="p-field">
        <label htmlFor="last_name">{t('last_name')}</label>
        <InputText
          id="last_name"
          value={user.last_name}
          onChange={(e) => onInputChange(e, 'last_name')}
          required
          className={classNames({ 'p-invalid': submitted && !user.last_name })}
        />
        {submitted && !user.last_name && (
          <small className="p-error">{t('this_value_is_required')}</small>
        )}
      </div>
      <div className="p-field">
        <label htmlFor="first_name">{t('first_name')}</label>
        <InputText
          id="first_name"
          value={user.first_name}
          onChange={(e) => onInputChange(e, 'first_name')}
          required
          className={classNames({ 'p-invalid': submitted && !user.first_name })}
        />
        {submitted && !user.first_name && (
          <small className="p-error">{t('this_value_is_required')}</small>
        )}
      </div>
      <div className="p-field">
        <div className="p-field-checkbox">
          <Checkbox
            id="enabled"
            checked={user.enabled}
            onChange={(e) => onInputBooleanChange(e, 'enabled')}
          />
          <label htmlFor="enabled">{t('status')}</label>
        </div>
      </div>
    </React.Fragment>
  );

  const userDialogFooter = (
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
        onClick={saveUser}
        disabled={loading}
      />
    </React.Fragment>
  );

  const userEditDialogFooter = (
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
        onClick={saveEditUser}
        disabled={loading}
      />
    </React.Fragment>
  );

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

  const leftContents = (
    <React.Fragment>
      <Button label={t('create')} icon="pi pi-user-plus" onClick={openNew} disabled={loading} />
    </React.Fragment>
  );

  const rightContents = (
    <React.Fragment>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter(e.target.value)}
          placeholder={t('search___')}
        />
      </span>
    </React.Fragment>
  );

  const header = (
    <div>
      <Toolbar left={leftContents} right={rightContents} />
    </div>
  );

  return (
    <div className="p-grid table-demo">
      <div className="p-col-12">
        <div className="card">
          <div style={{ whiteSpace: 'pre-line' }}>
            <Toast ref={toast} />
          </div>

          <DataTable
            ref={dt}
            dataKey="id"
            globalFilter={globalFilter}
            header={header}
            sortMode="multiple"
            value={users}
            paginator
            className="p-datatable-customers"
            rows={10}
            resizableColumns
            columnResizeMode="expand"
            responsiveLayout="scroll"
            rowHover
            emptyMessage={t('list_empty')}
            showGridlines
            stripedRows>
            <Column body={rowIndexTemplate} header="#" />
            <Column field="login" header={t('login')} />
            <Column field="last_name" header={t('last_name')} />
            <Column field="first_name" header={t('first_name')} />
            <Column body={enabledText} header={t('status')} />
            <Column field={createdAtText} header={t('created_at')} />
            <Column field={updateAtText} header={t('update_at')} />
            <Column body={actionBodyTemplate} />
          </DataTable>
        </div>
        <Dialog
          visible={userDialog}
          style={{ width: '450px' }}
          header={t('user_creat')}
          modal
          className="p-fluid"
          footer={userDialogFooter}
          onHide={hideDialog}>
          <div className="p-field">
            <label htmlFor="login">{t('login')}</label>
            <InputText
              id="login"
              value={user.login}
              onChange={(e) => onInputChange(e, 'login')}
              required
              autoFocus
              className={classNames({ 'p-invalid': submitted && !user.login })}
            />
            {submitted && !user.login && (
              <small className="p-error">{t('this_value_is_required')}</small>
            )}
          </div>
          {changePasswordTemplate}
          {userParamTemplate}
        </Dialog>

        <Dialog
          visible={userEditDialog}
          style={{ width: '450px' }}
          header={t('user_edit') + ' : ' + user.login}
          modal
          className="p-fluid"
          footer={userEditDialogFooter}
          onHide={hideDialog}>
          {userParamTemplate}
        </Dialog>
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
    </div>
  );
};
