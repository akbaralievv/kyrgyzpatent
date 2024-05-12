import React, { useState, useCallback, useEffect, useRef } from 'react';
import { KnowledgeServices } from '../../services/KnowledgeServices';
import { ReferenceServices } from '../../services/ReferenceServices';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { OverlayPanel } from 'primereact/overlaypanel';
import { MultiSelect } from 'primereact/multiselect';
import { TabView, TabPanel } from 'primereact/tabview';
import { ProgressBar } from 'primereact/progressbar';
import { Editor } from 'primereact/editor';
import { InputTextarea } from 'primereact/inputtextarea';

import {
  YMaps,
  Map,
  Placemark,
  GeolocationControl,
  RulerControl,
  SearchControl,
  TypeSelector,
} from 'react-yandex-maps';
import Dropzone from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import * as moment from 'moment';

import { useHistory } from 'react-router-dom';

const config = require('../../config/config.json');

export const KnowledgeAdminPage = () => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const {
    error,
    clearError,
    loading,
    getAllKnowledges,
    getAllKnowledgesByParam,
    createKnowledge,
    updateKnowledge,
    deleteKnowledge,
    uploadVideo,
    deleteVideo,
  } = KnowledgeServices();
  const { getReferencesByType } = ReferenceServices();
  const emptyKnowledge = {
    incoming_number: '',
    certificate_number: '',
    incoming_date: null,
    certificate_start_date: null,
    certificate_end_date: null,
    applicant: '',
    owner: '',
    bearer: '',
    phone: '',
    email: '',
    ref_region: 0,
    ref_area: 0,
    ref_village: 0,
    correspondence_address: '',
    origin_place: '',
    region_use: '',
    longitude: 0,
    latitude: 0,
    ref_vid: 0,
    ref_type: 0,
    knowledge_names: [],
    files: [],
  };

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
  const emptyKnowledgeName = {
    title: '',
    description: '',
    refLanguageLink: null,
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

  const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'], // toggled buttons
    ['blockquote', 'code-block'],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
    // [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    [{ direction: 'rtl' }], // text direction

    [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    // [{ 'font': [] }],
    // [{ 'align': [] }],

    ['clean'], // remove formatting button
  ];
  const renderEditorHeader = () => {
    return <></>;
  };
  const headerEditor = renderEditorHeader();

  const [selectedColumns, setSelectedColumns] = useState([]);
  const [fullSearchParam, setFullSearchParam] = useState(emptyFullSearchParam);
  const [knowledge, setKnowledge] = useState(emptyKnowledge);
  const [knowledgeName, setKnowledgeName] = useState(emptyKnowledgeName);
  const [refType, setRefType] = useState(null);
  const [refVid, setRefVid] = useState(null);
  const [refRegion, setRefRegion] = useState(null);
  const [refArea, setRefArea] = useState(null);
  const [refVillage, setRefVillage] = useState(null);
  const [knowledges, setKnowledges] = useState(null);
  const [knowledgeDialog, setKnowledgeDialog] = useState(false);
  const [imageDialog, setImageDialog] = useState(false);
  const [videoDialog, setVideoDialog] = useState(false);
  const [knowledgeNameDialog, setKnowledgeNameDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [knowledgeNameId, setKnowledgeNameId] = useState(-1);
  const [language, setLanguage] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState(false);
  const [totalSizeImage, setTotalSizeImage] = useState(null);
  const [totalSizeVideo, setTotalSizeVideo] = useState(null);

  const toast = useRef(null);
  const dt = useRef(null);
  const opMap = useRef(null);

  const fetchKnowledges = useCallback(async () => {
    try {
      const fetched = await getAllKnowledges();
      const fetchedType = await getReferencesByType('K_TYPE');
      const fetchedVid = await getReferencesByType('VID');
      const fetchedLanguage = await getReferencesByType('LANGUAGE');
      const fetchedRegion = await getReferencesByType('REGION');

      setRefRegion(fetchedRegion);
      setLanguage(fetchedLanguage);
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

  const openNew = () => {
    language.forEach((lan) => {
      if (lan.code === 'gb') {
        emptyKnowledge.knowledge_names[2] = {
          title: '',
          description: '',
          refLanguageLink: lan,
        };
      }
      if (lan.code === 'ru') {
        emptyKnowledge.knowledge_names[1] = {
          title: '',
          description: '',
          refLanguageLink: lan,
        };
      }
      if (lan.code === 'kg') {
        emptyKnowledge.knowledge_names[0] = {
          title: '',
          description: '',
          refLanguageLink: lan,
        };
      }
    });
    setKnowledge(emptyKnowledge);
    setSubmitted(false);
    setKnowledgeDialog(true);
  };

  const openNameNew = () => {
    setKnowledgeNameId(-1);
    setKnowledgeName(emptyKnowledgeName);
    setKnowledgeNameDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setKnowledgeNameDialog(false);
    setImageDialog(false);
    setKnowledgeDialog(false);
  };

  const hideNameDialog = () => {
    setSubmitted(false);
    setKnowledgeNameDialog(false);
  };

  const hideImageDialog = () => {
    setSubmitted(false);
    setImageDialog(false);
  };

  const hideVideoDialog = () => {
    setSubmitted(false);
    setVideoDialog(false);
  };

  const editImages = (knowledge) => {
    let _knowledge = { ...knowledge };
    _knowledge[`incoming_date`] = _knowledge.incoming_date
      ? new Date(_knowledge.incoming_date)
      : null;
    _knowledge[`certificate_start_date`] = _knowledge.certificate_start_date
      ? new Date(_knowledge.certificate_start_date)
      : null;
    _knowledge[`certificate_end_date`] = _knowledge.certificate_end_date
      ? new Date(_knowledge.certificate_end_date)
      : null;
    setKnowledge(_knowledge);

    setImageDialog(true);
  };

  const editVideo = (knowledge) => {
    let _knowledge = { ...knowledge };
    _knowledge[`incoming_date`] = _knowledge.incoming_date
      ? new Date(_knowledge.incoming_date)
      : null;
    _knowledge[`certificate_start_date`] = _knowledge.certificate_start_date
      ? new Date(_knowledge.certificate_start_date)
      : null;
    _knowledge[`certificate_end_date`] = _knowledge.certificate_end_date
      ? new Date(_knowledge.certificate_end_date)
      : null;
    setKnowledge(_knowledge);
    setVideoDialog(true);
  };

  const editKnowledge = async (knowledge) => {
    let _knowledge = { ...knowledge };
    _knowledge[`incoming_date`] = _knowledge.incoming_date
      ? new Date(_knowledge.incoming_date)
      : null;
    _knowledge[`certificate_start_date`] = _knowledge.certificate_start_date
      ? new Date(_knowledge.certificate_start_date)
      : null;
    _knowledge[`certificate_end_date`] = _knowledge.certificate_end_date
      ? new Date(_knowledge.certificate_end_date)
      : null;

    if (_knowledge.refRegionLink && _knowledge.refRegionLink.id) {
      const fetchedArea = await getReferencesByType('AREA', knowledge.refRegionLink.id);
      setRefArea(fetchedArea);
    }
    if (_knowledge.refAreaLink && _knowledge.refAreaLink.id) {
      const fetchedVillage = await getReferencesByType('VILLAGE', knowledge.refAreaLink.id);
      setRefVillage(fetchedVillage);
    }

    setKnowledge(_knowledge);
    setKnowledgeDialog(true);
  };

  const editKnowledgeName = (knowledgeName) => {
    let _knowledgeName = { ...knowledgeName };
    setKnowledgeNameId(findNameIndexById(_knowledgeName.refLanguageLink.id));
    setKnowledgeName(_knowledgeName);
    setKnowledgeNameDialog(true);
  };

  const deleteKnowledgeConfirm = (knowledge) => {
    setKnowledge({ ...knowledge });
    setDeleteDialog(true);
  };

  const deleteKnowledgeNameConfirm = (knowledgeName) => {
    let _knowledge = { ...knowledge };
    let _knowledgeNames = _knowledge.knowledge_names.filter(
      (val) => val.refLanguageLink.id !== knowledgeName.refLanguageLink.id,
    );
    _knowledge[`knowledge_names`] = _knowledgeNames;
    setKnowledge(_knowledge);
  };

  const deleteImageConfirm = async (knowledgeImage) => {
    await deleteVideo(knowledgeImage);
    let _knowledge = { ...knowledge };
    let _knowledgeImages = _knowledge.images.filter((val) => val.id !== knowledgeImage.id);
    _knowledge.images = _knowledgeImages;
    setKnowledge(_knowledge);
    let _knowledges = [...knowledges];
    const index = findIndexById(_knowledge.id);
    _knowledges[index] = _knowledge;
    setKnowledges(_knowledges);
    toast.current.show({ severity: 'success', summary: t('success'), life: 3000 });
  };

  const deleteVideoConfirm = async (knowledgeImage) => {
    await deleteVideo(knowledgeImage);
    let _knowledge = { ...knowledge };
    let _knowledgeImages = _knowledge.videos.filter((val) => val.id !== knowledgeImage.id);
    _knowledge.videos = _knowledgeImages;
    setKnowledge(_knowledge);
    let _knowledges = [...knowledges];
    const index = findIndexById(_knowledge.id);
    _knowledges[index] = _knowledge;
    setKnowledges(_knowledges);
    toast.current.show({ severity: 'success', summary: t('success'), life: 3000 });
  };

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
  };

  const saveKnowledge = async () => {
    try {
      setSubmitted(true);
      let _knowledge = { ...knowledge };
      if (_knowledge.ref_vid > 0 && _knowledge.ref_type > 0) {
        let _knowledges = [...knowledges];
        if (_knowledge.id) {
          const index = findIndexById(_knowledge.id);
          const data = await updateKnowledge(_knowledge);
          _knowledges[index] = data.knowledge;
          toast.current.show({
            severity: 'success',
            summary: t('success'),
            detail: t(data.message),
            life: 3000,
          });
        } else {
          const data = await createKnowledge(_knowledge);
          await _knowledges.push(data.knowledge);
          toast.current.show({
            severity: 'success',
            summary: t('success'),
            detail: t(data.message),
            life: 3000,
          });
        }
        await setKnowledges(_knowledges);
        setKnowledgeDialog(false);
        setKnowledge(emptyKnowledge);
        setSubmitted(false);
      }
    } catch (e) {
      toast.current.show({ severity: 'error', summary: t('error'), detail: e, life: 3000 });
    }
  };

  const saveKnowledgeName = async () => {
    try {
      setSubmittedName(true);
      let _knowledge = { ...knowledge };
      let _knowledgeName = { ...knowledgeName };
      if (
        _knowledgeName.refLanguageLink &&
        _knowledgeName.title.trim() &&
        _knowledgeName.description.trim()
      ) {
        let _knowledgeNames = [...knowledge.knowledge_names];
        let findNames = _knowledgeNames.filter(
          (val) =>
            val.refLanguageLink.id === _knowledgeName.refLanguageLink.id &&
            parseInt(findNameIndexById(_knowledgeName.refLanguageLink.id)) !==
              parseInt(knowledgeNameId),
        );
        if (findNames.length > 0) {
          toast.current.show({
            severity: 'error',
            summary: t('error'),
            detail: t('language_already_exists'),
            life: 3000,
          });
        } else {
          if (knowledgeNameId >= 0) {
            _knowledgeNames[knowledgeNameId] = _knowledgeName;
          } else {
            _knowledgeNames.push(_knowledgeName);
          }
          _knowledge.knowledge_names = _knowledgeNames;
          setKnowledgeNameDialog(false);
          setKnowledge(_knowledge);
          setKnowledgeName(emptyKnowledgeName);
          setSubmittedName(false);
          setKnowledgeNameId(-1);
        }
      }
    } catch (e) {
      toast.current.show({ severity: 'error', summary: t('error'), detail: e, life: 3000 });
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    let totalIMgSizeCurrent = 0;
    for (const imgCurrnet of acceptedFiles) {
      totalIMgSizeCurrent += parseInt(imgCurrnet.size);
    }
    if (totalSizeImage + totalIMgSizeCurrent < 10 * 1048576) {
      let _knowledge = { ...knowledge };
      let imageData = _knowledge.images;
      let errorText = false;
      for (const img of acceptedFiles) {
        if (img.type !== 'image/jpeg' && img.type !== 'image/png') {
          errorText = true;
          toast.current.show({
            severity: 'error',
            summary: t('error'),
            detail: img.name + ': ' + t('not_jpg_png'),
            life: 6000,
          });
        } else {
          let formData = new FormData();
          formData.append('file', img);
          await uploadVideo(formData, _knowledge.id)
            .then((state) => {
              imageData.push(state.file);
            })
            .catch((error) => {
              toast.current.show({
                severity: 'error',
                summary: t('error'),
                detail: t(error),
                life: 3000,
              });
            });
        }
      }
      _knowledge.images = imageData;
      setKnowledge(_knowledge);
      let _knowledges = [...knowledges];
      const index = findIndexById(_knowledge.id);
      _knowledges[index] = _knowledge;
      setKnowledges(_knowledges);
      if (!errorText)
        toast.current.show({ severity: 'success', summary: t('success'), life: 3000 });
    } else {
      toast.current.show({ severity: 'error', summary: t('error_size'), life: 3000 });
    }
  });

  const onDropVideo = useCallback(async (acceptedFiles) => {
    let totalIMgSizeCurrent = 0;
    for (const imgCurrnet of acceptedFiles) {
      totalIMgSizeCurrent += parseInt(imgCurrnet.size);
    }
    if (totalSizeVideo + totalIMgSizeCurrent < 300 * 1048576) {
      let _knowledge = { ...knowledge };
      let imageData = _knowledge.videos;
      let errorText = false;
      for (const img of acceptedFiles) {
        if (img.type !== 'video/mp4') {
          errorText = true;
          toast.current.show({
            severity: 'error',
            summary: t('error'),
            detail: img.name + ': ' + t('not_mp4'),
            life: 6000,
          });
        } else {
          let formData = new FormData();
          formData.append('file', img);
          await uploadVideo(formData, _knowledge.id)
            .then((state) => {
              imageData.push(state.file);
            })
            .catch((error) => {
              toast.current.show({
                severity: 'error',
                summary: t('error'),
                detail: t(error),
                life: 3000,
              });
            });
        }
      }
      _knowledge.videos = imageData;
      setKnowledge(_knowledge);
      let _knowledges = [...knowledges];
      const index = findIndexById(_knowledge.id);
      _knowledges[index] = _knowledge;
      setKnowledges(_knowledges);
      if (!errorText)
        toast.current.show({ severity: 'success', summary: t('success'), life: 3000 });
    } else {
      toast.current.show({ severity: 'error', summary: t('error_size'), life: 3000 });
    }
  });

  const deleteRef = async () => {
    try {
      let _knowledges = [...knowledges];
      let _knowledge = { ...knowledge };
      if (_knowledge.id) {
        const data = await deleteKnowledge(_knowledge);
        _knowledges = knowledges.filter((val) => val.id !== _knowledge.id);
        setKnowledges(_knowledges);
        toast.current.show({
          severity: 'success',
          summary: t('success'),
          detail: t(data.message),
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: 'error',
          summary: t('error'),
          detail: t('missing_id'),
          life: 3000,
        });
      }
      setDeleteDialog(false);
      setKnowledge(emptyKnowledge);
    } catch (e) {}
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

  const onMapClick = async (e) => {
    const val = e.get('coords');
    if (val.length === 2) {
      let _knowledge = { ...knowledge };
      _knowledge['longitude'] = val[0];
      _knowledge['latitude'] = val[1];
      setKnowledge(_knowledge);
    }
    opMap.current.hide();
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _knowledge = { ...knowledge };
    _knowledge[`${name}`] = val;
    setKnowledge(_knowledge);
  };

  const onKnowledgeNameInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _knowledgeName = { ...knowledgeName };
    _knowledgeName[`${name}`] = val;
    setKnowledgeName(_knowledgeName);
  };

  const onKnowledgeNameDescriptionChange = (e, name) => {
    const val = e.htmlValue || '';

    let _knowledgeName = { ...knowledgeName };
    _knowledgeName[`${name}`] = val;
    setKnowledgeName(_knowledgeName);
  };

  const onFullSearchInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _fullSearchParam = { ...fullSearchParam };
    _fullSearchParam[`${name}`] = val;
    setFullSearchParam(_fullSearchParam);
  };

  const onDateChange = (e, name) => {
    const val = (e && e.value) || '';
    let _knowledge = { ...knowledge };
    _knowledge[`${name}`] = val;
    setKnowledge(_knowledge);
  };

  const onRefVidChange = (e) => {
    const val = e.value || null;
    let _knowledge = { ...knowledge };
    _knowledge['refVidLink'] = val;
    _knowledge['ref_vid'] = val.id || '';
    setKnowledge(_knowledge);
  };

  const onRefRegionChange = async (e) => {
    const val = e.value || null;
    let _knowledge = { ...knowledge };
    _knowledge['refRegionLink'] = val;
    _knowledge['ref_region'] = val.id || '';

    _knowledge['refAreaLink'] = null;
    _knowledge['ref_area'] = null;
    _knowledge['refVillageLink'] = null;
    _knowledge['ref_village'] = null;
    let areaData = await getReferencesByType('AREA', val.id);
    setRefArea(areaData);
    setKnowledge(_knowledge);
  };
  const onRefAreaChange = async (e) => {
    const val = e.value || null;
    let _knowledge = { ...knowledge };
    _knowledge['refAreaLink'] = val;
    _knowledge['ref_area'] = val.id || '';
    _knowledge['refVillageLink'] = null;
    _knowledge['ref_village'] = null;
    let villageData = await getReferencesByType('VILLAGE', val.id);
    setRefVillage(villageData);
    setKnowledge(_knowledge);
  };
  const onRefVillageChange = (e) => {
    const val = e.value || null;
    let _knowledge = { ...knowledge };
    _knowledge['refVillageLink'] = val;
    _knowledge['ref_village'] = val.id || '';
    setKnowledge(_knowledge);
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

  const onKnowledgeNameLanguageLinkChange = (e) => {
    const val = e.value || null;
    let _knowledgeName = { ...knowledgeName };
    _knowledgeName['refLanguageLink'] = val;
    setKnowledgeName(_knowledgeName);
  };

  const onRefTypeChange = (e) => {
    const val = e.value || null;
    let _knowledge = { ...knowledge };
    _knowledge['refTypeLink'] = val;
    _knowledge['ref_type'] = val.id || '';
    setKnowledge(_knowledge);
  };

  const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < knowledges.length; i++) {
      if (knowledges[i].id === id) {
        index = i;
        break;
      }
    }
    return index;
  };

  const findNameIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < knowledge.knowledge_names.length; i++) {
      if (knowledge.knowledge_names[i].refLanguageLink.id === id) {
        index = i;
        break;
      }
    }
    return index;
  };

  const rowIndexTemplate = (rowData, column) => {
    return column.rowIndex + 1 + '';
  };

  const refVidText = (rowData) => {
    return rowData.refVidLink && rowData.refVidLink.title ? rowData.refVidLink.title : '';
  };

  const refRegionText = (rowData) => {
    return rowData.refRegionLink && rowData.refRegionLink.title ? rowData.refRegionLink.title : '';
  };

  const refAreaText = (rowData) => {
    return rowData.refAreaLink && rowData.refAreaLink.title ? rowData.refAreaLink.title : '';
  };
  const refVillageText = (rowData) => {
    return rowData.refVillageLink && rowData.refVillageLink.title
      ? rowData.refVillageLink.title
      : '';
  };

  const refTypeText = (rowData) => {
    return rowData.refTypeLink && rowData.refTypeLink.title ? rowData.refTypeLink.title : '';
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

  const iconText = (rowData) => {
    return (
      <div>
        <i className={'fi fi-' + rowData.refLanguageLink.icon} />
        <label>{rowData.refLanguageLink.title}</label>
      </div>
    );
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

  useEffect(() => {
    if (knowledge.images) {
      let total = 0;
      for (let img of knowledge.images) {
        total += parseInt(img.size);
      }
      setTotalSizeImage(total);
    }
    if (knowledge.videos) {
      let totalV = 0;
      for (let vid of knowledge.videos) {
        totalV += parseInt(vid.size);
      }
      setTotalSizeVideo(totalV);
    }
  }, [knowledge]);

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
        <div>
          <Button
            icon="pi pi-images"
            className="p-button-rounded p-mr-2"
            onClick={() => editImages(rowData)}
            disabled={loading}
          />
        </div>
        <div>
          <Button
            icon="pi pi-video"
            className="p-button-rounded p-mr-2"
            onClick={() => editVideo(rowData)}
            disabled={loading}
          />
        </div>
        <div>
          <Button
            icon="pi pi-pencil"
            className="p-button-rounded p-mr-2"
            onClick={() => editKnowledge(rowData)}
            disabled={loading}
          />
        </div>
        <div>
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-mr-2"
            onClick={() => deleteKnowledgeConfirm(rowData)}
            disabled={loading}
          />
        </div>
      </React.Fragment>
    );
  };

  const actionBodyNameTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-mr-2"
          onClick={() => editKnowledgeName(rowData)}
          disabled={loading}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-mr-2"
          onClick={() => deleteKnowledgeNameConfirm(rowData)}
          disabled={loading}
        />
      </React.Fragment>
    );
  };
  const actionBodyImageTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-mr-2"
          onClick={() => deleteImageConfirm(rowData)}
          disabled={loading}
        />
      </React.Fragment>
    );
  };

  const actionBodyVideoTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-mr-2"
          onClick={() => deleteVideoConfirm(rowData)}
          disabled={loading}
        />
      </React.Fragment>
    );
  };
  const galleriaItemTemplate = (item) => {
    return (
      <img
        src={'/' + item.filename}
        alt={item.filename}
        style={{ width: '20%', display: 'block' }}
      />
    );
  };

  const knowledgeParamTemplate = (
    <React.Fragment>
      <div className="p-field">
        <DataTable
          dataKey="nameId"
          sortMode="multiple"
          value={knowledge.knowledge_names}
          columnResizeMode="expand"
          responsiveLayout="scroll"
          emptyMessage={t('list_empty')}
          showGridlines>
          <Column field={iconText} header={t('language_text')} style={{ width: '10%' }} />
          <Column
            field={'title'}
            header={t('knowledge_name')}
            style={{ width: '30%', minWidth: '200px' }}
          />
          <Column
            field={'description'}
            header={t('description')}
            style={{ maxWidth: '50%', minWidth: '200px' }}
          />
          <Column
            body={actionBodyNameTemplate}
            header={<Button label={t('create')} onClick={openNameNew} disabled={loading} />}
            style={{ width: '10%' }}
          />
        </DataTable>
      </div>
      <div className="p-grid">
        <div className="p-col-12 p-md-6 p-lg-6">
          <label htmlFor="ref_vid">{t('vid')}</label>
          <Dropdown
            inputId="ref_vid"
            value={knowledge.refVidLink}
            options={refVid}
            optionLabel={'title'}
            onChange={(e) => onRefVidChange(e)}
            className={classNames({ 'p-invalid': submitted && !knowledge.refVidLink })}
            filter
          />
          {submitted && !knowledge.ref_vid && (
            <small className="p-error">{t('this_value_is_required')}</small>
          )}
        </div>
        <div className="p-col-12 p-md-6 p-lg-6">
          <label htmlFor="ref_type">{t('type')}</label>
          <Dropdown
            inputId="ref_type"
            value={knowledge.refTypeLink}
            options={refType}
            optionLabel={'title'}
            onChange={(e) => onRefTypeChange(e)}
            className={classNames({ 'p-invalid': submitted && !knowledge.refTypeLink })}
            filter
          />
          {submitted && !knowledge.ref_type && (
            <small className="p-error">{t('this_value_is_required')}</small>
          )}
        </div>
        <div className="p-col-12 p-md-6 p-lg-6">
          <label htmlFor="incoming_number">{t('incoming_number')}</label>
          <InputText
            id="incoming_number"
            value={knowledge.incoming_number}
            onChange={(e) => onInputChange(e, 'incoming_number')}
            required
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-6">
          <label htmlFor="certificate_number">{t('certificate_number')}</label>
          <InputText
            id="certificate_number"
            value={knowledge.certificate_number}
            onChange={(e) => onInputChange(e, 'certificate_number')}
            required
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-4">
          <label htmlFor="incoming_date">{t('incoming_date')}</label>
          <Calendar
            dateFormat="dd/mm/yy"
            id="incoming_date"
            value={knowledge.incoming_date}
            onChange={(e) => onDateChange(e, 'incoming_date')}
            locale={i18n.language === 'gb' ? '' : 'ru'}
            required
            showIcon
            hideOnDateTimeSelect
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-4">
          <label htmlFor="certificate_start_date">{t('certificate_start_date')}</label>
          <Calendar
            dateFormat="dd/mm/yy"
            id="certificate_start_date"
            value={knowledge.certificate_start_date}
            onChange={(e) => onDateChange(e, 'certificate_start_date')}
            locale={i18n.language === 'gb' ? '' : 'ru'}
            required
            showIcon
            hideOnDateTimeSelect
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-4">
          <label htmlFor="certificate_end_date">{t('certificate_end_date')}</label>
          <Calendar
            dateFormat="dd/mm/yy"
            id="certificate_end_date"
            value={knowledge.certificate_end_date}
            onChange={(e) => onDateChange(e, 'certificate_end_date')}
            locale={i18n.language === 'gb' ? '' : 'ru'}
            required
            showIcon
            hideOnDateTimeSelect
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-12">
          <label htmlFor="applicant">{t('applicant')}</label>
          <InputText
            id="applicant"
            value={knowledge.applicant}
            onChange={(e) => onInputChange(e, 'applicant')}
            required
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-12">
          <label htmlFor="owner">{t('owner')}</label>
          <InputText
            id="owner"
            value={knowledge.owner}
            onChange={(e) => onInputChange(e, 'owner')}
            required
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-12">
          <label htmlFor="bearer">{t('bearer')}</label>
          <InputText
            id="bearer"
            value={knowledge.bearer}
            onChange={(e) => onInputChange(e, 'bearer')}
            required
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-6">
          <label htmlFor="correspondence_address">{t('correspondence_address')}</label>
          <InputText
            id="correspondence_address"
            value={knowledge.correspondence_address}
            onChange={(e) => onInputChange(e, 'correspondence_address')}
            required
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-3">
          <label htmlFor="phone">{t('phone')}</label>
          <InputText
            id="phone"
            value={knowledge.phone}
            onChange={(e) => onInputChange(e, 'phone')}
            required
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-3">
          <label htmlFor="email">{t('email')}</label>
          <InputText
            id="email"
            value={knowledge.email}
            onChange={(e) => onInputChange(e, 'email')}
            required
          />
        </div>

        <div className="p-col-12 p-md-6 p-lg-12">
          <label htmlFor="origin_place">{t('origin_place')}</label>
          <InputText
            id="origin_place"
            value={knowledge.origin_place}
            onChange={(e) => onInputChange(e, 'origin_place')}
            required
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-4">
          <label htmlFor="ref_region">{t('region')}</label>
          <Dropdown
            inputId="ref_region"
            value={knowledge.refRegionLink}
            options={refRegion}
            optionLabel={'title'}
            onChange={(e) => onRefRegionChange(e)}
            filter
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-4">
          <label htmlFor="ref_area">{t('area')}</label>
          <Dropdown
            inputId="ref_area"
            value={knowledge.refAreaLink}
            options={refArea}
            optionLabel={'title'}
            onChange={(e) => onRefAreaChange(e)}
            filter
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-4">
          <label htmlFor="ref_village">{t('village')}</label>
          <Dropdown
            inputId="ref_village"
            value={knowledge.refVillageLink}
            options={refVillage}
            optionLabel={'title'}
            onChange={(e) => onRefVillageChange(e)}
            filter
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-12">
          <label htmlFor="region_use">{t('region_use')}</label>
          <InputText
            id="region_use"
            value={knowledge.region_use}
            onChange={(e) => onInputChange(e, 'region_use')}
            required
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-4">
          <label htmlFor="latitude"></label>
          <Button
            type="button"
            icon="pi pi-map-marker"
            label={t('select_coordinates')}
            onClick={(e) => opMap.current.toggle(e)}
            aria-haspopup
            aria-controls="overlay_panel"
            className="select-product-button"
          />
          <OverlayPanel
            ref={opMap}
            showCloseIcon
            id="overlay_panel"
            style={{ width: '95%', height: '85%' }}
            className="overlaypanel-demo">
            <YMaps
              enterprise
              query={{
                lang:
                  i18n.language === 'kg'
                    ? 'ru_RU'
                    : i18n.language + '-' + i18n.language.toUpperCase(),
                apikey: config.yndexApiKey,
              }}>
              <div>
                <Map
                  width="100%"
                  height="80vh"
                  defaultState={{
                    center: [41.4, 74.5],
                    zoom: 7,
                    controls: ['zoomControl', 'fullscreenControl'],
                  }}
                  modules={['control.ZoomControl', 'control.FullscreenControl']}
                  onClick={(e) => {
                    onMapClick(e);
                  }}
                  options={{
                    searchControlProvider: 'yandex#search',
                  }}>
                  {knowledge.longitude && knowledge.latitude && (
                    <Placemark
                      key={knowledge.longitude + knowledge.latitude}
                      defaultGeometry={[knowledge.longitude, knowledge.latitude]}
                    />
                  )}
                  <GeolocationControl options={{ float: 'left' }} />
                  <RulerControl options={{ float: 'right' }} />
                  <SearchControl options={{ float: 'right' }} />
                  <TypeSelector options={{ float: 'right' }} />
                </Map>
              </div>
            </YMaps>
          </OverlayPanel>
        </div>

        <div className="p-col-12 p-md-6 p-lg-4">
          <InputText
            id="longitude"
            value={knowledge.longitude}
            onChange={(e) => onInputChange(e, 'longitude')}
            required
          />
        </div>
        <div className="p-col-12 p-md-6 p-lg-4">
          <InputText
            id="latitude"
            value={knowledge.latitude}
            onChange={(e) => onInputChange(e, 'latitude')}
            required
          />
        </div>
      </div>
    </React.Fragment>
  );

  const knowledgeNameParamTemplate = (
    <React.Fragment>
      <div className="p-field">
        <label htmlFor="refLanguageLink">{t('language_text')}</label>
        <Dropdown
          inputId="refLanguageLink"
          value={knowledgeName.refLanguageLink}
          options={language}
          optionLabel={'title'}
          onChange={(e) => onKnowledgeNameLanguageLinkChange(e)}
          className={classNames({ 'p-invalid': submittedName && !knowledgeName.refLanguageLink })}
          filter
        />
        {submittedName && !knowledgeName.refLanguageLink && (
          <small className="p-error">{t('this_value_is_required')}</small>
        )}
      </div>

      <div className="p-field">
        <label htmlFor="title">{t('title')}</label>
        <InputText
          id="title"
          value={knowledgeName.title}
          onChange={(e) => onKnowledgeNameInputChange(e, 'title')}
          required
          className={classNames({ 'p-invalid': submittedName && !knowledgeName.title })}
        />
        {submittedName && !knowledgeName.title && (
          <small className="p-error">{t('this_value_is_required')}</small>
        )}
      </div>
      <div className="p-field">
        <label htmlFor="description">{t('description')}</label>
        <InputTextarea
          id="description"
          value={knowledgeName.description}
          onChange={(e) => onKnowledgeNameInputChange(e, 'description')}
          required
          className={classNames({ 'p-invalid': submittedName && !knowledgeName.description })}
        />
        {submittedName && !knowledgeName.description && (
          <small className="p-error">{t('this_value_is_required')}</small>
        )}
      </div>

      {/* <div id="editor">
                <div className="p-editor-container">
                    <div className='p-editor-toolbar'>
                        <div className='p-editor-content'>
                            <div dangerouslySetInnerHTML={{ __html: knowledgeName.description }} />

                            <Editor
                                modules={{ toolbar: toolbarOptions }}
                                style={{ height: '320px' }}
                                value={knowledgeName.description}
                                theme='snow'
                                headerTemplate={headerEditor}
                                onTextChange={(e) => onKnowledgeNameDescriptionChange(e, 'description')} />
                        </div>
                    </div>
                </div>
                </div> */}
    </React.Fragment>
  );

  const imageParamTemplate = (
    <React.Fragment>
      <div>
        <Dropzone onDrop={onDrop}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Button label={t('add_file')}></Button>
              </div>
            </section>
          )}
        </Dropzone>
        <DataTable value={knowledge.images} emptyMessage={t('list_empty')} header={false}>
          <Column field={galleriaItemTemplate} style={{ minWidth: '20px' }} />
          <Column field={'originalname'} style={{ minWidth: '20px' }} />
          <Column field={'size'} style={{ minWidth: '20px' }} />
          <Column
            body={actionBodyImageTemplate}
            header={
              <ProgressBar
                value={totalSizeImage}
                displayValueTemplate={() => `${(totalSizeImage / 1048576).toFixed(2)} / 10 MB`}
                style={{ width: '300px', height: '20px', marginLeft: 'auto' }}></ProgressBar>
            }
          />
        </DataTable>
      </div>
    </React.Fragment>
  );

  const videoParamTemplate = (
    <React.Fragment>
      <div>
        <Dropzone onDrop={onDropVideo}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Button label={t('add_file')}></Button>
              </div>
            </section>
          )}
        </Dropzone>
        <DataTable value={knowledge.videos} emptyMessage={t('list_empty')} header={false}>
          <Column field={'originalname'} style={{ minWidth: '20px' }} />
          <Column field={'size'} style={{ minWidth: '20px' }} />
          <Column
            body={actionBodyVideoTemplate}
            header={
              <ProgressBar
                value={totalSizeVideo}
                displayValueTemplate={() => `${(totalSizeVideo / 1048576).toFixed(2)} / 300 MB`}
                style={{ width: '300px', height: '20px', marginLeft: 'auto' }}></ProgressBar>
            }
          />
        </DataTable>
      </div>
    </React.Fragment>
  );

  const knowledgeDialogFooter = (
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
        onClick={saveKnowledge}
        disabled={loading}
      />
    </React.Fragment>
  );

  const knowledgeNameDialogFooter = (
    <React.Fragment>
      <Button
        label={t('cancel')}
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideNameDialog}
        disabled={loading}
      />
      <Button
        label={t('save')}
        icon="pi pi-check"
        className="p-button-text"
        onClick={saveKnowledgeName}
        disabled={loading}
      />
    </React.Fragment>
  );

  const imageDialogFooter = (
    <React.Fragment>
      <Button
        label={t('cancel')}
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideImageDialog}
        disabled={loading}
      />
    </React.Fragment>
  );

  const videoDialogFooter = (
    <React.Fragment>
      <Button
        label={t('cancel')}
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideVideoDialog}
        disabled={loading}
      />
    </React.Fragment>
  );

  const leftContents = (
    <React.Fragment>
      <Button label={t('create')} onClick={openNew} disabled={loading} />
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

  const deleteDialogFooter = (
    <React.Fragment>
      <Button
        label={t('no')}
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDeleteDialog}
        disabled={loading}
      />
      <Button
        label={t('yes')}
        icon="pi pi-check"
        className="p-button-text"
        onClick={deleteRef}
        disabled={loading}
      />
    </React.Fragment>
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
                      optionLabel={'title'}
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
                      optionLabel={'title'}
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
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'bearer') && (
              <Column field="bearer" header={t('bearer')} />
            )}
            {selectedColumns &&
              selectedColumns.some((sCol) => sCol.field === 'correspondence_address') && (
                <Column field="correspondence_address" header={t('correspondence_address')} />
              )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'phone') && (
              <Column field="phone" header={t('phone')} />
            )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'email') && (
              <Column field="email" header={t('email')} />
            )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'region') && (
              <Column body={refRegionText} header={t('region')} />
            )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'area') && (
              <Column body={refAreaText} header={t('area')} />
            )}
            {selectedColumns && selectedColumns.some((sCol) => sCol.field === 'village') && (
              <Column body={refVillageText} header={t('village')} />
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
        <Dialog
          visible={knowledgeDialog}
          style={{ width: '80%' }}
          header={t('title')}
          modal
          className="p-fluid"
          footer={knowledgeDialogFooter}
          onHide={hideDialog}>
          {knowledgeParamTemplate}
        </Dialog>
        <Dialog
          visible={knowledgeNameDialog}
          style={{ width: '50%' }}
          header={t('knowledge_name')}
          modal
          className="p-fluid"
          footer={knowledgeNameDialogFooter}
          onHide={hideNameDialog}>
          {knowledgeNameParamTemplate}
        </Dialog>
        <Dialog
          visible={imageDialog}
          style={{ width: '50%' }}
          header={t('image_text')}
          modal
          footer={imageDialogFooter}
          onHide={hideImageDialog}>
          {imageParamTemplate}
        </Dialog>
        <Dialog
          visible={videoDialog}
          style={{ width: '50%' }}
          header={t('video_text')}
          modal
          footer={videoDialogFooter}
          onHide={hideVideoDialog}>
          {videoParamTemplate}
        </Dialog>
        <Dialog
          visible={deleteDialog}
          style={{ width: '450px' }}
          header={t('confirmation')}
          modal
          footer={deleteDialogFooter}
          onHide={hideDeleteDialog}>
          <div className="confirmation-content">
            <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
            {knowledge && (
              <span>
                <b>{t('you_want_delete')}</b>
              </span>
            )}
          </div>
        </Dialog>
      </div>
    </div>
  );
};
