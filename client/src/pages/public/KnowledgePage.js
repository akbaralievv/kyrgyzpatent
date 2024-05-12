import React, { useState, useCallback, useEffect, useRef } from 'react';
import { KnowledgeServices } from '../../services/KnowledgeServices';
import { ReferenceServices } from '../../services/ReferenceServices';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { TabView, TabPanel } from 'primereact/tabview';

import { useTranslation } from 'react-i18next';

import * as moment from 'moment';

import { useHistory } from 'react-router-dom';

export const KnowledgePage = () => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const { error, clearError, loading, getAllKnowledges, getAllKnowledgesByParam } =
    KnowledgeServices();
  const { getReferencesByType } = ReferenceServices();

  const emptyFullSearchParam = {
    name: '',
    description: '',
    ref_vid: '',
    ref_type: '',
    incoming_number: '',
    certificate_number: '',
    incoming_date: '',
    certificate_start_date: '',
    certificate_end_date: '',
    owner: '',
    bearer: '',
    phone: '',
    email: '',
    applicant: '',
    correspondence_address: '',
    origin_place: '',
    region_use: '',
    allparams: '',
  };

  const columns = [
    { field: 'knowledge_name', header: t('knowledge_name') },
    { field: 'vid', header: t('vid') },
    { field: 'type', header: t('type') },
    { field: 'bearer', header: t('bearer') },
    { field: 'phone', header: t('phone') },
    { field: 'email', header: t('email') },
    { field: 'region', header: t('region') },
    { field: 'area', header: t('area') },
    { field: 'village', header: t('village') },
    { field: 'incoming_number', header: t('incoming_number') },
    { field: 'certificate_number', header: t('certificate_number') },
    { field: 'incoming_date', header: t('incoming_date') },
    { field: 'certificate_start_date', header: t('certificate_start_date') },
    { field: 'certificate_end_date', header: t('certificate_end_date') },
    { field: 'owner', header: t('owner') },
    { field: 'applicant', header: t('applicant') },
    { field: 'correspondence_address', header: t('correspondence_address') },
    { field: 'origin_place', header: t('origin_place') },
    { field: 'region_use', header: t('region_use') },
    { field: 'longitude', header: t('longitude') },
    { field: 'latitude', header: t('latitude') },
    { field: 'created_user_name', header: t('created_user_name') },
    { field: 'updated_user_name', header: t('updated_user_name') },
    { field: 'created_at', header: t('created_at') },
    { field: 'update_at', header: t('update_at') },
  ];

  const [selectedColumns, setSelectedColumns] = useState([]);
  const [fullSearchParam, setFullSearchParam] = useState(emptyFullSearchParam);
  const [refType, setRefType] = useState(null);
  const [refVid, setRefVid] = useState(null);
  const [knowledges, setKnowledges] = useState(null);
  const [refRegion, setRefRegion] = useState(null);
  const [refArea, setRefArea] = useState(null);
  const [refVillage, setRefVillage] = useState(null);

  const toast = useRef(null);
  const dt = useRef(null);

  const fetchKnowledges = useCallback(async () => {
    try {
      const fetched = await getAllKnowledges();
      const fetchedType = await getReferencesByType('K_TYPE');
      const fetchedVid = await getReferencesByType('VID');
      const fetchedRegion = await getReferencesByType('REGION');
      setRefRegion(fetchedRegion);
      setRefType(fetchedType);
      setRefVid(fetchedVid);
      setKnowledges(fetched);
      setSelectedColumns([columns[0]]);
    } catch (e) {}
  }, []);

  const onColumnToggle = (event) => {
    let selectedColumns = event.value;
    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field),
    );
    setSelectedColumns(orderedSelectedColumns);
  };

  const onFullSearch = async (allParams) => {
    try {
      let paramS = {};
      if (allParams) {
        paramS.allparams = fullSearchParam.allparams;
      } else {
        paramS = fullSearchParam;
        paramS.allparams = '';
      }
      const data = await getAllKnowledgesByParam(paramS);
      setKnowledges(data.knowledges);
    } catch (e) {}
  };

  const onFullSearchInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _fullSearchParam = { ...fullSearchParam };
    _fullSearchParam[`${name}`] = val;
    setFullSearchParam(_fullSearchParam);
  };

  const onFullSearchRefVidChange = (e) => {
    const val = e.value || null;
    let _fullSearchParam = { ...fullSearchParam };
    _fullSearchParam['refVidLink'] = val;
    _fullSearchParam['ref_vid'] = val.id || '';
    setFullSearchParam(_fullSearchParam);
  };

  const onFullSearchRefRegionChange = async (e) => {
    const val = e.value || null;
    let _fullSearchParam = { ...fullSearchParam };
    _fullSearchParam['refRegionLink'] = val;
    _fullSearchParam['ref_region'] = val.id || '';

    _fullSearchParam['refAreaLink'] = null;
    _fullSearchParam['ref_area'] = null;
    _fullSearchParam['refVillageLink'] = null;
    _fullSearchParam['ref_village'] = null;

    let areaData = await getReferencesByType('AREA', val.id);
    setRefArea(areaData);
    setFullSearchParam(_fullSearchParam);
  };

  const onFullSearchRefAreaChange = async (e) => {
    const val = e.value || null;
    let _fullSearchParam = { ...fullSearchParam };
    _fullSearchParam['refAreaLink'] = val;
    _fullSearchParam['ref_area'] = val.id || '';

    _fullSearchParam['refVillageLink'] = null;
    _fullSearchParam['ref_village'] = null;

    let villageData = await getReferencesByType('VILLAGE', val.id);
    setRefVillage(villageData);

    setFullSearchParam(_fullSearchParam);
  };

  const onFullSearchRefVillageChange = (e) => {
    const val = e.value || null;
    let _fullSearchParam = { ...fullSearchParam };
    _fullSearchParam['refVillageLink'] = val;
    _fullSearchParam['ref_village'] = val.id || '';
    setFullSearchParam(_fullSearchParam);
  };

  const onFullSearchRefTypeChange = (e) => {
    const val = e.value || null;
    let _fullSearchParam = { ...fullSearchParam };
    _fullSearchParam['refTypeLink'] = val;
    _fullSearchParam['ref_type'] = val.id || '';
    setFullSearchParam(_fullSearchParam);
  };

  const onFullSearchDateChange = (e, name) => {
    const val = (e && e.value) || '';
    let _fullSearchParam = { ...fullSearchParam };
    _fullSearchParam[`${name}`] = val;
    setFullSearchParam(_fullSearchParam);
  };

  const rowIndexTemplate = (rowData, column) => {
    return column.rowIndex + 1 + '';
  };

  const refVidText = (rowData) => {
    return rowData.refVidLink && rowData.refVidLink.title
      ? i18n.language === 'ru'
        ? rowData.refVidLink.title_ru
        : i18n.language === 'kg'
        ? rowData.refVidLink.title
        : rowData.refVidLink.title_en
      : '';
  };

  const refTypeText = (rowData) => {
    return rowData.refTypeLink && rowData.refTypeLink.title
      ? i18n.language === 'ru'
        ? rowData.refTypeLink.title_ru
        : i18n.language === 'kg'
        ? rowData.refTypeLink.title
        : rowData.refTypeLink.title_en
      : '';
  };

  const incomingDateText = (rowData) => {
    return rowData.incoming_date ? moment(rowData.incoming_date).format('YYYY-MM-DD') : '';
  };

  const certificateStartDateText = (rowData) => {
    return rowData.certificate_start_date
      ? moment(rowData.certificate_start_date).format('YYYY-MM-DD')
      : '';
  };

  const certificateEndDateText = (rowData) => {
    return rowData.certificate_end_date
      ? moment(rowData.certificate_end_date).format('YYYY-MM-DD')
      : '';
  };

  const createdAtText = (rowData) => {
    return rowData.createdAt ? moment(rowData.createdAt).format('YYYY-MM-DD') : '';
  };

  const updateAtText = (rowData) => {
    return rowData.updatedAt ? moment(rowData.createdAt).format('YYYY-MM-DD') : '';
  };

  const knowledgeNameText = (rowData) => {
    return (
      <>
        <DataTable value={rowData.knowledge_names} emptyMessage={t('list_empty')} header={false}>
          <Column field={titleShort} style={{ minWidth: '20px' }} />
          <Column field={descriptionShort} style={{ minWidth: '20px' }} />
        </DataTable>
      </>
    );
  };

  const titleShort = (rowData) => {
    if (rowData.title.length > 30) {
      return (
        <>
          <i className={'fi fi-' + rowData.refLanguageLink.icon} />
          {rowData.title.substring(0, 30) + '...'}
        </>
      );
    }
    return (
      <>
        <i className={'fi fi-' + rowData.refLanguageLink.icon} />
        {rowData.title}
      </>
    );
  };

  const descriptionShort = (rowData) => {
    if (rowData.description.length > 50) {
      return rowData.description.substring(0, 50) + '...';
    }
    return rowData.description;
  };

  useEffect(() => {
    fetchKnowledges();
  }, [fetchKnowledges]);

  useEffect(() => {
    if (error) {
      toast.current.show({ severity: 'error', summary: t('error'), detail: t(error), life: 3000 });
      clearError();
    }
  }, [error, clearError]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onFullSearch(true);
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <div>
          <Button
            icon="pi pi-search-plus"
            className="p-button-rounded p-mr-2"
            onClick={() => history.push('/detail/' + rowData.id)}
            disabled={loading}
          />
        </div>
      </React.Fragment>
    );
  };

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      let _knowledges = [...knowledges];
      let _newKnowledges = [];
      _knowledges.forEach((know) => {
        let new_know = know;
        know.knowledge_names.forEach((name) => {
          new_know['title_' + name.refLanguageLink.code] = name.title;
          new_know['description_' + name.refLanguageLink.code] = name.description;
        });
        new_know.ref_vid = new_know.refVidLink?.title;
        new_know.ref_type = new_know.refTypeLink?.title;

        new_know.ref_region = new_know.refRegionLink ? new_know.refRegionLink.title : '';
        new_know.ref_area =
          new_know.refAreaLink && new_know.refAreaLink.title ? new_know.refAreaLink.title : '';
        new_know.ref_village =
          new_know.refVillageLink && new_know.refVillageLink.title
            ? new_know.refVillageLink.title
            : '';

        delete new_know.id;
        delete new_know.images;
        delete new_know.videos;
        delete new_know.knowledge_names;
        delete new_know.refTypeLink;
        delete new_know.refVidLink;
        delete new_know.refRegionLink;
        delete new_know.refAreaLink;
        delete new_know.refVillageLink;
        _newKnowledges.push(new_know);
      });

      const worksheet = xlsx.utils.json_to_sheet(_newKnowledges);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      saveAsExcelFile(excelBuffer, 'knowledges');
    });
  };

  const saveAsExcelFile = (buffer, fileName) => {
    import('file-saver').then((FileSaver) => {
      let EXCEL_TYPE =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let EXCEL_EXTENSION = '.xlsx';
      const data = new Blob([buffer], {
        type: EXCEL_TYPE,
      });
      FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    });
  };

  const getLocalizedTitle = (item) => {
    switch (i18n.language) {
      case 'ru':
        return item.title_ru;
      case 'kg':
        return item.title;
      default:
        return item.title_en;
    }
  };

  const leftContents = (
    <React.Fragment>
      <div className="flex align-items-center export-buttons">
        <Button
          type="button"
          icon="pi pi-file-excel"
          onClick={exportExcel}
          className="p-button-success mr-2"
          data-pr-tooltip="XLS"
        />
      </div>
    </React.Fragment>
  );

  const rightContents = (
    <React.Fragment>
      <span className="p-input-icon-left">
        <MultiSelect
          value={selectedColumns}
          options={columns}
          optionLabel="header"
          onChange={onColumnToggle}
          style={{ width: '20em' }}
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
    <div className="datatable-scroll-demo">
      <div className="p-col-12">
        <div className="card">
          <div style={{ whiteSpace: 'pre-line' }}>
            <Toast ref={toast} />
          </div>
          <div className="card">
            <TabView>
              <TabPanel header={t('simple_search')}>
                <div className="p-grid p-fluid">
                  <div className="p-col-12 p-md-6 p-lg-2">
                    <Button onClick={(e) => onFullSearch(true)} label={t('search_text')} />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-10">
                    <InputText
                      id="allparams"
                      value={fullSearchParam.allparams}
                      onChange={(e) => onFullSearchInputChange(e, 'allparams')}
                      required
                      placeholder={t('enter_text_to_search')}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
              </TabPanel>
              <TabPanel header={t('full_search')}>
                <div className="p-grid p-fluid">
                  <div className="p-col-12 p-md-6 p-lg-6">
                    <label htmlFor="knowledge_name_s">{t('knowledge_name')}</label>
                    <InputText
                      id="knowledge_name_s"
                      value={fullSearchParam.name}
                      onChange={(e) => onFullSearchInputChange(e, 'name')}
                      required
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-6">
                    <label htmlFor="knowledge_description_s">{t('description')}</label>
                    <InputText
                      id="knowledge_description_s"
                      value={fullSearchParam.description}
                      onChange={(e) => onFullSearchInputChange(e, 'description')}
                      required
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-6">
                    <label htmlFor="ref_vid_s">{t('vid')}</label>
                    <Dropdown
                      inputId="ref_vid_s"
                      value={fullSearchParam.refVidLink}
                      options={refVid}
                      optionLabel={(option) => getLocalizedTitle(option)}
                      onChange={(e) => onFullSearchRefVidChange(e)}
                      emptyMessage={
                        <span>
                          {i18n.language === 'ru'
                            ? 'Нет доступных опций'
                            : i18n.language === 'kg'
                            ? 'Жеткиликтүү опциялар жок'
                            : 'No available options'}
                        </span>
                      }
                      filter
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-6">
                    <label htmlFor="ref_type_s">{t('type')}</label>
                    <Dropdown
                      inputId="ref_type_s"
                      value={fullSearchParam.refTypeLink}
                      options={refType}
                      emptyMessage={
                        <span>
                          {i18n.language === 'ru'
                            ? 'Нет доступных опций'
                            : i18n.language === 'kg'
                            ? 'Жеткиликтүү опциялар жок'
                            : 'No available options'}
                        </span>
                      }
                      optionLabel={(option) => getLocalizedTitle(option)}
                      onChange={(e) => onFullSearchRefTypeChange(e)}
                      filter
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-6">
                    <label htmlFor="incoming_number_s">{t('incoming_number')}</label>
                    <InputText
                      id="incoming_number_s"
                      value={fullSearchParam.incoming_number}
                      onChange={(e) => onFullSearchInputChange(e, 'incoming_number')}
                      required
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-6">
                    <label htmlFor="certificate_number_s">{t('certificate_number')}</label>
                    <InputText
                      id="certificate_number_s"
                      value={fullSearchParam.certificate_number}
                      onChange={(e) => onFullSearchInputChange(e, 'certificate_number')}
                      required
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-4">
                    <label htmlFor="incoming_date_s">{t('incoming_date')}</label>
                    <Calendar
                      dateFormat="dd/mm/yy"
                      id="incoming_date_s"
                      value={fullSearchParam.incoming_date}
                      onChange={(e) => onFullSearchDateChange(e, 'incoming_date')}
                      locale={i18n.language === 'gb' ? '' : 'ru'}
                      required
                      showIcon
                      hideOnDateTimeSelect
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-4">
                    <label htmlFor="certificate_start_date_s">{t('certificate_start_date')}</label>
                    <Calendar
                      dateFormat="dd/mm/yy"
                      id="certificate_start_date_s"
                      value={fullSearchParam.certificate_start_date}
                      onChange={(e) => onFullSearchDateChange(e, 'certificate_start_date')}
                      locale={i18n.language === 'gb' ? '' : 'ru'}
                      required
                      showIcon
                      hideOnDateTimeSelect
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-4">
                    <label htmlFor="certificate_end_date_s">{t('certificate_end_date')}</label>
                    <Calendar
                      dateFormat="dd/mm/yy"
                      id="certificate_end_date_s"
                      value={fullSearchParam.certificate_end_date}
                      onChange={(e) => onFullSearchDateChange(e, 'certificate_end_date')}
                      locale={i18n.language === 'gb' ? '' : 'ru'}
                      required
                      showIcon
                      hideOnDateTimeSelect
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-4">
                    <label htmlFor="owner_s">{t('owner')}</label>
                    <InputText
                      id="owner_s"
                      value={fullSearchParam.owner}
                      onChange={(e) => onFullSearchInputChange(e, 'owner')}
                      required
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-4">
                    <label htmlFor="applicant_s">{t('applicant')}</label>
                    <InputText
                      id="applicant_s"
                      value={fullSearchParam.applicant}
                      onChange={(e) => onFullSearchInputChange(e, 'applicant')}
                      required
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-4">
                    <label htmlFor="bearer_s">{t('bearer')}</label>
                    <InputText
                      id="bearer_s"
                      value={fullSearchParam.bearer}
                      onChange={(e) => onFullSearchInputChange(e, 'bearer')}
                      required
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-4">
                    <label htmlFor="correspondence_address_s">{t('correspondence_address')}</label>
                    <InputText
                      id="correspondence_address_s"
                      value={fullSearchParam.correspondence_address}
                      onChange={(e) => onFullSearchInputChange(e, 'correspondence_address')}
                      required
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-4">
                    <label htmlFor="phone_s">{t('phone')}</label>
                    <InputText
                      id="phone_s"
                      value={fullSearchParam.phone}
                      onChange={(e) => onFullSearchInputChange(e, 'phone')}
                      required
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-4">
                    <label htmlFor="email_s">{t('email')}</label>
                    <InputText
                      id="email_s"
                      value={fullSearchParam.email}
                      onChange={(e) => onFullSearchInputChange(e, 'email')}
                      required
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-4">
                    <label htmlFor="ref_region_s">{t('region')}</label>
                    <Dropdown
                      inputId="ref_region_s"
                      value={fullSearchParam.refRegionLink}
                      options={refRegion}
                      optionLabel={'title'}
                      emptyMessage={
                        <span>
                          {i18n.language === 'ru'
                            ? 'Нет доступных опций'
                            : i18n.language === 'kg'
                            ? 'Жеткиликтүү опциялар жок'
                            : 'No available options'}
                        </span>
                      }
                      onChange={(e) => onFullSearchRefRegionChange(e)}
                      filter
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-4">
                    <label htmlFor="ref_area_s">{t('area')}</label>
                    <Dropdown
                      inputId="ref_area_s"
                      value={fullSearchParam.refAreaLink}
                      options={refArea}
                      optionLabel={'title'}
                      emptyMessage={
                        <span>
                          {i18n.language === 'ru'
                            ? 'Нет доступных опций'
                            : i18n.language === 'kg'
                            ? 'Жеткиликтүү опциялар жок'
                            : 'No available options'}
                        </span>
                      }
                      onChange={(e) => onFullSearchRefAreaChange(e)}
                      filter
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-4">
                    <label htmlFor="ref_village_s">{t('village')}</label>
                    <Dropdown
                      inputId="ref_village_s"
                      value={fullSearchParam.refVillageLink}
                      options={refVillage}
                      optionLabel={'title'}
                      emptyMessage={
                        <span>
                          {i18n.language === 'ru'
                            ? 'Нет доступных опций'
                            : i18n.language === 'kg'
                            ? 'Жеткиликтүү опциялар жок'
                            : 'No available options'}
                        </span>
                      }
                      onChange={(e) => onFullSearchRefVillageChange(e)}
                      filter
                    />
                  </div>

                  <div className="p-col-12 p-md-6 p-lg-6">
                    <label htmlFor="origin_place_s">{t('origin_place')}</label>
                    <InputText
                      id="origin_place_s"
                      value={fullSearchParam.origin_place}
                      onChange={(e) => onFullSearchInputChange(e, 'origin_place')}
                      required
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-6">
                    <label htmlFor="region_use_s">{t('region_use')}</label>
                    <InputText
                      id="region_use_s"
                      value={fullSearchParam.region_use}
                      onChange={(e) => onFullSearchInputChange(e, 'region_use')}
                      required
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-3">
                    <Button
                      onClick={(e) => {
                        setFullSearchParam(emptyFullSearchParam);
                      }}
                      label={t('reset')}
                    />
                  </div>
                  <div className="p-col-12 p-md-6 p-lg-6"></div>
                  <div className="p-col-12 p-md-6 p-lg-3">
                    <Button onClick={(e) => onFullSearch(false)} label={t('search_text')} />
                  </div>
                </div>
              </TabPanel>
            </TabView>
          </div>
          <DataTable
            ref={dt}
            dataKey="id"
            header={header}
            sortMode="multiple"
            value={knowledges}
            paginator
            className="p-datatable-customers"
            rows={10}
            resizableColumns
            columnResizeMode="expand"
            responsiveLayout="scroll"
            emptyMessage={t('list_empty')}
            showGridlines
            stripedRows>
            <Column body={rowIndexTemplate} header="#" />
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'knowledge_name') && (
              <Column body={knowledgeNameText} header={t('knowledge_name')} />
            )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'vid') && (
              <Column body={refVidText} header={t('vid')} />
            )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'type') && (
              <Column field={refTypeText} header={t('type')} />
            )}
            {selectedColumns &&
              selectedColumns.some((sCol) => sCol.field === 'incoming_number') && (
                <Column field="incoming_number" header={t('incoming_number')} />
              )}
            {selectedColumns &&
              selectedColumns.some((sCol) => sCol.field === 'certificate_number') && (
                <Column field="certificate_number" header={t('certificate_number')} />
              )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'incoming_date') && (
              <Column body={incomingDateText} header={t('incoming_date')} />
            )}
            {selectedColumns &&
              selectedColumns.some((sCol) => sCol.field === 'certificate_start_date') && (
                <Column body={certificateStartDateText} header={t('certificate_start_date')} />
              )}
            {selectedColumns &&
              selectedColumns.some((sCol) => sCol.field === 'certificate_end_date') && (
                <Column body={certificateEndDateText} header={t('certificate_end_date')} />
              )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'owner') && (
              <Column field="owner" header={t('owner')} />
            )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'applicant') && (
              <Column field="applicant" header={t('applicant')} />
            )}
            {selectedColumns &&
              selectedColumns.some((sCol) => sCol.field === 'correspondence_address') && (
                <Column field="correspondence_address" header={t('correspondence_address')} />
              )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'origin_place') && (
              <Column field="origin_place" header={t('origin_place')} />
            )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'region_use') && (
              <Column field="region_use" header={t('region_use')} />
            )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'longitude') && (
              <Column field="longitude" header={t('longitude')} />
            )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'latitude') && (
              <Column field="latitude" header={t('latitude')} />
            )}
            {selectedColumns &&
              selectedColumns.some((sCol) => sCol.field === 'created_user_name') && (
                <Column field="created_user_id" header={t('created_user_name')} />
              )}
            {selectedColumns &&
              selectedColumns.some((sCol) => sCol.field === 'updated_user_name') && (
                <Column field="updated_user_id" header={t('updated_user_name')} />
              )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'created_at') && (
              <Column body={createdAtText} header={t('created_at')} />
            )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'update_at') && (
              <Column body={updateAtText} header={t('update_at')} />
            )}

            <Column body={actionBodyTemplate} />
          </DataTable>
        </div>
      </div>
    </div>
  );
};
