import React, { useEffect, useState, useRef, useCallback } from 'react';

import { Toast } from 'primereact/toast';

import {
  YMaps,
  Map,
  Clusterer,
  Placemark,
  GeolocationControl,
  RulerControl,
  SearchControl,
  TypeSelector,
} from 'react-yandex-maps';

import { useTranslation } from 'react-i18next';

import { KnowledgeServices } from '../../services/KnowledgeServices';
import { ReferenceServices } from '../../services/ReferenceServices';

import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

const config = require('../../config/config.json');

export const HomePage = () => {
  const { error, clearError, getAllKnowledges, getAllKnowledgesByParam } = KnowledgeServices();

  const { getReferencesByType } = ReferenceServices();

  const toast = useRef(null);

  const { t, i18n } = useTranslation();

  const [knowledgesData, setKnowledgesData] = useState([]);

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

  const [fullSearchParam, setFullSearchParam] = useState(emptyFullSearchParam);
  const [refType, setRefType] = useState(null);
  const [refVid, setRefVid] = useState(null);
  const [refRegion, setRefRegion] = useState(null);
  const [refArea, setRefArea] = useState(null);
  const [refVillage, setRefVillage] = useState(null);

  const fetchKnowledges = useCallback(async () => {
    try {
      const fetched = await getAllKnowledges();
      const fetchedType = await getReferencesByType('K_TYPE');
      const fetchedVid = await getReferencesByType('VID');
      const fetchedRegion = await getReferencesByType('REGION');
      setRefRegion(fetchedRegion);
      setRefType(fetchedType);
      setRefVid(fetchedVid);
      setKnowledgesData(fetched);
    } catch (e) {}
  }, []);

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
      setKnowledgesData(data.knowledges);
    } catch (e) {}
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

  const placemarkList = () => {
    let row = [];
    knowledgesData.forEach((know) => {
      if (know.longitude > 0 && know.latitude > 0) {
        let name = '';
        let description = '';
        let stop = false;
        know.knowledge_names.forEach((val) => {
          if (!stop) {
            if (val.refLanguageLink.code === i18n.language) {
              name = val.title;
              description = val.description;
              stop = true;
            }
            if (!stop && val.refLanguageLink.code === 'ru') {
              name = val.title + ' (RU)';
              description = val.description;
            }
            if (!stop && val.refLanguageLink.code === 'kg' && name === '') {
              name = val.title + ' (KG)';
              description = val.description;
            }
          }
        });
        if (name === '') {
          name =
            know.knowledge_names[0].title + ` (${know.knowledge_names[0].refLanguageLink.code})`;
          description = know.knowledge_names[0].description;
        }

        if (description.length > 200) description = description.substring(0, 200) + '...';

        row.push(
          <Placemark
            key={'key-' + know.id}
            id={'id-' + know.id}
            defaultGeometry={[know.longitude, know.latitude]}
            options={{
              iconColor: know.refVidLink.icon,
            }}
            // 'islands#invertedVioletClusterIcons'
            modules={['geoObject.addon.balloon']}
            properties={{
              balloonContentHeader: `<span class="description">${
                know.refTypeLink && know.refTypeLink.title ? know.refTypeLink.title : ''
              }</span>`,

              balloonContentBody: `${name}<br>${description}`,
              balloonContentFooter: `<a href = "detail/${know.id}">${t('detail')}</a><br>`,
            }}
          />,
        );
      }
    });
    return <div>{row}</div>;
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

  return (
    <div className="grid">
      <div className="col-12">
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
                      onChange={(e) => onFullSearchRefVidChange(e)}
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
                      emptyMessage={
                        <span>
                          {i18n.language === 'ru'
                            ? 'Нет доступных опций'
                            : i18n.language === 'kg'
                            ? 'Жеткиликтүү опциялар жок'
                            : 'No available options'}
                        </span>
                      }
                      optionLabel={'title'}
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
          {knowledgesData && (
            <YMaps
              // enterprise
              query={{
                lang:
                  i18n.language === 'kg'
                    ? 'ru_RU'
                    : i18n.language + '-' + i18n.language.toUpperCase(),
                apikey: config.yndexApiKey,
              }}>
              <Map
                width="100%"
                height="80vh"
                options={{
                  autoFitToViewport: 'always',
                  groupByCoordinates: 'true',
                  searchControlProvider: 'yandex#search',
                }}
                defaultState={{
                  center: [41.4, 74.5],
                  zoom: 7,
                  controls: ['zoomControl', 'fullscreenControl'],
                }}
                modules={['control.ZoomControl', 'control.FullscreenControl']}>
                <Clusterer
                  options={{
                    preset: 'islands#invertedVioletClusterIcons',
                    groupByCoordinates: false,
                  }}>
                  {placemarkList()}
                </Clusterer>
                <GeolocationControl options={{ float: 'left' }} />
                <RulerControl options={{ float: 'right' }} />
                <SearchControl options={{ float: 'right' }} />
                <TypeSelector options={{ float: 'right', panoramasItemMode: 'on' }} />
              </Map>
            </YMaps>
          )}
        </div>
      </div>
    </div>
  );
};
