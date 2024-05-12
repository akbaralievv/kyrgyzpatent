import React, { useState, useCallback, useEffect, useRef } from 'react'
import { ReferenceServices } from "../../services/ReferenceServices"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';

import { useTranslation } from 'react-i18next';

import * as moment from 'moment'
export const ReferencePage = () => {

    const { t, i18n } = useTranslation();
    const { error, clearError, loading, getAllReferences, createReference, updateReference, deleteReference } = ReferenceServices();

    const emptyReference = {
        type: '',
        code: '',
        title: '',
        icon: '',
        description: '',
        enabled: true
    };

    const [references, setReferences] = useState(null);
    const [referenceDialog, setReferenceDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [reference, setReference] = useState(emptyReference);
    const [regionData, setRegionData] = useState(null);
    const [areaData, setAreaData] = useState(null)
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    const fetchReferences = useCallback(async () => {
        try {
            const fetched = await getAllReferences();
            setReferences(fetched);
        } catch (e) {
        }
    }, []);



    const openNew = () => {
        setReference(emptyReference);
        setSubmitted(false);
        setReferenceDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setReferenceDialog(false);
    };

    const editReference = (reference) => {
        let _reference = { ...reference };
        _reference[`start_date`] = new Date(_reference.start_date);
        _reference[`end_date`] = new Date(_reference.end_date);
        if (_reference['type'] === 'AREA') {
            let regionValues = []
            for (let i = 0; i < references.length; i++) {
                if (references[i].type === 'REGION') {
                    regionValues.push(references[i])
                }
                if (references[i].id === _reference.parent_id) {
                    _reference[`area`] = references[i];
                }
            }
            setRegionData(regionValues)
        }
        if (_reference['type'] === 'VILLAGE') {
            let regionValues = []
            let areaValues = []
            for (let i = 0; i < references.length; i++) {
                if (references[i].type === 'REGION') {
                    regionValues.push(references[i])
                }
                else if (references[i].type === 'AREA') {
                    areaValues.push(references[i])
                }

                if (references[i].id === _reference.parent_id) {
                    _reference[`village`] = references[i];
                    for (let j = 0; j < references.length; j++) {
                        if (references[j].id === references[i].parent_id) {
                            _reference[`area`] = references[j];
                        }
                    }
                }
            }
            setAreaData(areaValues)
            setRegionData(regionValues)
        }
        setReference(_reference);
        setReferenceDialog(true);
    };

    const deleteReferenceConfirm = (reference) => {
        setReference({ ...reference });
        setDeleteDialog(true);
    };

    const hideDeleteDialog = () => {
        setDeleteDialog(false);
    };

    useEffect(() => {
    }, [reference.start_date]);

    const saveReference = async () => {
        try {
            setSubmitted(true);
            let _reference = { ...reference };
            let errorType = true;
            if (_reference.type.trim() && (_reference.type === 'AREA' || _reference.type === 'VILLAGE')) {
                errorType = false;
                if (_reference.parent_id > 0)
                    errorType = true;
            }

            if (errorType &&
                _reference.type.trim() &&
                _reference.type.trim() &&
                _reference.code.trim() &&
                _reference.title.trim() &&
                _reference.start_date) {
                let _references = [...references];
                if (_reference.id) {
                    const index = findIndexById(reference.id);
                    const data = await updateReference(_reference);
                    _references[index] = data.reference;
                    toast.current.show({ severity: 'success', summary: t('success'), detail: t(data.message), life: 3000 });

                } else {
                    const data = await createReference(_reference);
                    await _references.push(data.reference);
                    toast.current.show({ severity: 'success', summary: t('success'), detail: t(data.message), life: 3000 });
                }
                await setReferences(_references);
                setReferenceDialog(false);
                setReference(emptyReference);

            }
        } catch (e) {
            toast.current.show({ severity: 'error', summary: t('error'), detail: e, life: 3000 });
        }
    };

    const deleteRef = async () => {
        try {
            let _references = [...references];
            let _reference = { ...reference };
            if (_reference.id) {
                const data = await deleteReference(_reference);
                _references = references.filter(val => val.id !== _reference.id);
                setReferences(_references);
                toast.current.show({ severity: 'success', summary: t('success'), detail: t(data.message), life: 3000 });
            } else {
                toast.current.show({ severity: 'error', summary: t('error'), detail: t('missing_id'), life: 3000 });
            }
            setDeleteDialog(false);
            setReference(emptyReference);

        } catch (e) { }
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _reference = { ...reference };
        _reference[`${name}`] = val;
        setReference(_reference);
    };

    const onInputBooleanChange = (e, name) => {
        const val = e.checked || false;
        let _reference = { ...reference };
        _reference[`${name}`] = val;
        setReference(_reference);
    };

    const onTypeChange = (e, name) => {
        const val = (e && e.value) || '';
        let _reference = { ...reference };
        _reference[`${name}`] = val;
       
            _reference[`village`] = null;
            _reference[`parent_id`] = null;
       
        let regionValues = []
        for (let i = 0; i < references.length; i++) {
            if (references[i].type === 'REGION') {
                regionValues.push(references[i])
            }
        }
        setRegionData(regionValues)
        setReference(_reference);
    };
    const onAreaChange = (e, name) => {

        const val = (e && e.value) || '';
        let _reference = { ...reference }
        _reference[`${name}`] = val;
        if (_reference.type === 'VILLAGE') {
            _reference[`village`] = null;
            _reference[`parent_id`] = null;
        }
        else {
            _reference[`parent_id`] = val.id;
        }
        let areaValues = []
        for (let i = 0; i < references.length; i++) {
            if (references[i].type === 'AREA' && references[i].parent_id === val.id) {
                areaValues.push(references[i])
            }
        }
        setAreaData(areaValues)
        setReference(_reference);
    };
    const onVillageChange = (e, name) => {
        const val = (e && e.value) || '';
        let _reference = { ...reference }
        _reference[`${name}`] = val;
        _reference[`parent_id`] = val.id;
        setReference(_reference);
    };

    const onDateChange = (e, name) => {
        const val = (e && e.value) || '';
        let _reference = { ...reference };
        _reference[`${name}`] = val;
        setReference(_reference);
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < references.length; i++) {
            if (references[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    };

    const rowIndexTemplate = (rowData, column) => {
        return column.rowIndex + 1 + ""
    };

    const enabledText = (rowData) => {
        return rowData.enabled ? t('active') : t('blocked')
    };

    const iconText = (rowData) => {
        if (rowData.type === 'LANGUAGE') {
            return <i className={"fi fi-" + rowData.icon}></i>
        }
        return (<i className={"pi " + rowData.icon}>{rowData.icon}</i>)
    };

    const startDateText = (rowData) => {
        return rowData.start_date ? moment(rowData.start_date).format('YYYY-MM-DD') : ''
    };

    const endDateText = (rowData) => {
        return rowData.end_date ? moment(rowData.end_date).format('YYYY-MM-DD') : ''
    };

    const createdAtText = (rowData) => {
        return rowData.createdAt ? moment(rowData.createdAt).format('YYYY-MM-DD') : ''
    };

    const updateAtText = (rowData) => {
        return rowData.updatedAt ? moment(rowData.createdAt).format('YYYY-MM-DD') : ''
    };

    useEffect(() => {
        fetchReferences()
    }, [fetchReferences]);

    useEffect(() => {
        if (error) {
            toast.current.show({ severity: 'error', summary: t('error'), detail: t(error), life: 3000 });
            clearError();
        }
    }, [error, clearError]);

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" className="p-button-rounded p-mr-2"
                    onClick={() => editReference(rowData)} disabled={loading} />
                <Button icon="pi pi-trash" className="p-button-rounded p-mr-2"
                    onClick={() => deleteReferenceConfirm(rowData)} disabled={loading} />
            </React.Fragment>
        );
    };

    const referenceParamTemplate = (
        <React.Fragment>

            <div className="p-field">
                <label htmlFor="type">
                    {t('type')}
                </label>
                <Dropdown
                    value={reference.type}
                    options={['LANGUAGE', 'VID', 'K_TYPE', 'REGION', 'AREA', 'VILLAGE']}
                    onChange={(e) => onTypeChange(e, "type")}
                />
                {submitted && !reference.type && <small className="p-error">{t('this_value_is_required')}</small>}
            </div>
            {reference.type && reference.type === 'AREA' &&
                <div className="p-field">
                    <label htmlFor="region">
                        {t('region')}
                    </label>
                    <Dropdown
                        value={reference.area}
                        options={regionData}
                        optionLabel={"title"}
                        onChange={(e) => onAreaChange(e, "area")}
                    />
                    {submitted && !reference.area && <small className="p-error">{t('this_value_is_required')}</small>}
                </div>
            }
            {reference.type && reference.type === 'VILLAGE' &&
                <>
                    <div className="p-field">
                        <label htmlFor="region">
                            {t('region')}
                        </label>
                        <Dropdown
                            value={reference.area}
                            options={regionData}
                            optionLabel={"title"}
                            onChange={(e) => onAreaChange(e, "area")}
                        />
                        {submitted && !reference.area && <small className="p-error">{t('this_value_is_required')}</small>}
                    </div>
                    <div className="p-field">
                        <label htmlFor="area">
                            {t('area')}
                        </label>
                        <Dropdown
                            value={reference.village}
                            options={areaData}
                            optionLabel={"title"}
                            onChange={(e) => onVillageChange(e, "village")}
                        />
                        {submitted && !reference.village && <small className="p-error">{t('this_value_is_required')}</small>}

                    </div>
                </>
            }
            <div className="p-field">
                <label htmlFor="code">
                    {t('code')}
                </label>
                <InputText
                    id="code"
                    value={reference.code}
                    onChange={(e) => onInputChange(e, 'code')}
                    required
                    className={classNames({ 'p-invalid': submitted && !reference.code })}
                />
                {submitted && !reference.code && <small className="p-error">{t('this_value_is_required')}</small>}
            </div>
            <div className="p-field">
                <label htmlFor="title">
                    {t('title_text')}
                </label>
                <InputText
                    id="title"
                    value={reference.title}
                    onChange={(e) => onInputChange(e, 'title')}
                    required
                    className={classNames({ 'p-invalid': submitted && !reference.title })}
                />
                {submitted && !reference.title && <small className="p-error">{t('this_value_is_required')}</small>}
            </div>
            <div className="p-field">
                <label htmlFor="description">
                    {t('description')}
                </label>
                <InputText
                    id="description"
                    value={reference.description}
                    onChange={(e) => onInputChange(e, 'description')}
                    required
                />
            </div>
            <div className="p-field">
                <label htmlFor="start_date">
                    {t('start_date')}
                </label>
                <Calendar dateFormat="dd/mm/yy"  id="start_date"
                    value={reference.start_date}
                    onChange={(e) => onDateChange(e, 'start_date')}
                    locale={i18n.language === 'gb' ? '' : 'ru'}
                    className={classNames({ 'p-invalid': submitted && !reference.start_date })}
                    required
                    showIcon
                    hideOnDateTimeSelect
                />
                {submitted && !reference.start_date && <small className="p-error">{t('this_value_is_required')}</small>}
            </div>
            <div className="p-field">
                <label htmlFor="end_date">
                    {t('end_date')}
                </label>
                <Calendar dateFormat="dd/mm/yy"  id="end_date"
                    value={reference.end_date}
                    onChange={(e) => onDateChange(e, 'end_date')}
                    locale={i18n.language === 'gb' ? '' : 'ru'}
                    required
                    showIcon
                    hideOnDateTimeSelect
                />
            </div>
            <div className="p-field">
                <label htmlFor="icon">
                    {t('icon')}
                </label>
                <InputText
                    id="icon"
                    value={reference.icon}
                    onChange={(e) => onInputChange(e, 'icon')}
                    required
                />
            </div>
            <div className="p-field">
                <div className="p-field-checkbox">
                    <Checkbox id="enabled" checked={reference.enabled} onChange={(e) => onInputBooleanChange(e, 'enabled')} />
                    <label htmlFor="enabled">
                        {t('status')}
                    </label>
                </div>
            </div>
        </React.Fragment>
    );

    const referenceDialogFooter = (
        <React.Fragment>
            <Button label={t('cancel')} icon="pi pi-times" className="p-button-text" onClick={hideDialog}
                disabled={loading} />
            <Button label={t('save')} icon="pi pi-check" className="p-button-text" onClick={saveReference}
                disabled={loading} />
        </React.Fragment>
    );

    const leftContents = (
        <React.Fragment>
            <Button label={t('create')} icon="pi pi-book"
                onClick={openNew} disabled={loading} />
        </React.Fragment>
    );


    const rightContents = (
        <React.Fragment>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder={t('search___')} />
            </span>
        </React.Fragment>
    );

    const header = (
        <div>
            <Toolbar left={leftContents} right={rightContents} />
        </div>
    );

    const deleteDialogFooter = (
        <React.Fragment>
            <Button label={t('no')} icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} disabled={loading} />
            <Button label={t('yes')} icon="pi pi-check" className="p-button-text" onClick={deleteRef} disabled={loading} />
        </React.Fragment>
    );

    return (
        <div className="datatable-scroll-demo">
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
                        value={references}
                        paginator
                        className="p-datatable-customers"
                        rows={10}
                        resizableColumns
                        columnResizeMode="expand"
                        responsiveLayout="scroll"
                        rowHover
                        emptyMessage={t('list_empty')}
                        showGridlines
                        stripedRows
                    >
                        <Column body={rowIndexTemplate} header="#" />
                        <Column field="type" header={t('type')} />
                        {/* <Column field="parent_id" header={t('parent_id')} /> */}
                        <Column field="code" header={t('code')} />
                        <Column field="title" header={t('title_text')} />
                        <Column body={iconText} header={t('icon')} />
                        <Column field="description" header={t('description')} />
                        <Column body={startDateText} header={t('start_date')} />
                        <Column body={endDateText} header={t('end_date')} />
                        <Column body={enabledText} header={t('status')} />
                        <Column body={createdAtText} header={t('created_at')} />
                        <Column body={updateAtText} header={t('update_at')} />
                        <Column body={actionBodyTemplate} />
                    </DataTable>
                </div>
                <Dialog
                    visible={referenceDialog}
                    style={{ width: '450px' }}
                    header={t('references')}
                    modal
                    className="p-fluid"
                    footer={referenceDialogFooter}
                    onHide={hideDialog}>
                    {referenceParamTemplate}
                </Dialog>
                <Dialog visible={deleteDialog} style={{ width: '450px' }} header={t('confirmation')} modal footer={deleteDialogFooter} onHide={hideDeleteDialog}>
                    <div className="confirmation-content">
                        <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                        {reference && <span><b>{t('you_want_delete')}</b></span>}
                    </div>
                </Dialog>
            </div>
        </div>
    )
};