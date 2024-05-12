import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Toast } from 'primereact/toast';

import { useTranslation } from 'react-i18next';

import { KnowledgeServices } from '../../services/KnowledgeServices';
import { Galleria } from 'primereact/galleria';
import { Fieldset } from 'primereact/fieldset';
import VideoPlayer from 'react-video-js-player';

import * as moment from 'moment';

export const DetailPage = () => {
  const { error, clearError, getAllKnowledgesByParam } = KnowledgeServices();
  const { t, i18n } = useTranslation();
  const toast = useRef(null);
  const knowledgeId = useParams().id;
  const [knowledge, setKnowledge] = useState(null);

  const fetchKnowledge = useCallback(async () => {
    try {
      const fetched = await getAllKnowledgesByParam({ id: knowledgeId });
      setKnowledge(fetched.knowledges[0]);
    } catch (e) {}
  }, []);

  const iconTitleText = (rowData) => {
    return (
      <div key={rowData.id}>
        <h5>
          <i className={'fi fi-' + rowData.refLanguageLink.icon} />
          <label>{rowData.title}</label>
        </h5>
      </div>
    );
  };

  const incomingDateText = () => {
    return knowledge.incoming_date ? moment(knowledge.incoming_date).format('YYYY-MM-DD') : '';
  };

  const certificateStartDateText = () => {
    return knowledge.certificate_start_date
      ? moment(knowledge.certificate_start_date).format('YYYY-MM-DD')
      : '';
  };
  const certificateEndDateText = () => {
    return knowledge.certificate_end_date
      ? moment(knowledge.certificate_end_date).format('YYYY-MM-DD')
      : '';
  };

  useEffect(() => {
    fetchKnowledge();
  }, [fetchKnowledge, knowledgeId]);

  useEffect(() => {
    if (error) {
      toast.current.show({ severity: 'error', summary: t('error'), detail: t(error), life: 3000 });
      clearError();
    }
  }, [error, clearError]);

  const galleriaItemTemplate = (item) => (
    <img
      key={item.filename}
      alt={item.filename}
      src={'/' + item.filename}
      style={{ width: '100%', display: 'block' }}
    />
  );
  const galleriaThumbnailTemplate = (item) => {
    if (knowledge.images.length > 1) {
      return (
        <img
          key={item.filename}
          alt={item.filename}
          src={'/' + item.filename}
          style={{ width: '100%', display: 'block' }}
        />
      );
    } else {
      return (
        <img
          key={item.filename}
          alt={item.filename}
          src={'/' + item.filename}
          style={{ width: '10%', display: 'block' }}
        />
      );
    }
  };
  const galleriaResponsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '960px',
      numVisible: 4,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];

  const knowledgeNamesList = () => {
    let row = [];
    knowledge.knowledge_names.forEach((know) => {
      row.push(
        <div className="card" key={know.id}>
          <Fieldset key={know.id} legend={iconTitleText(know)} toggleable>
            <p>{know.description}</p>
          </Fieldset>
        </div>,
      );
    });
    return <>{row}</>;
  };

  const videoList = () => {
    let row = [];
    knowledge.videos.forEach((know) => {
      row.push(
        <VideoPlayer
          key={know.id + '-' + know.filename}
          id={know.id + '-' + know.filename}
          src={'/' + know.filename}
          height="420px"
          width="720px"
        />,
      );
    });
    return <div>{row}</div>;
  };

  const knowledgeParamTemplate = (
    <div>
      {knowledge && (
        <>
          <div className="p-field">
            <div className="p-col-12 p-md-6 p-lg-12 ">
              <label htmlFor="ref_vid">
                <h2>
                  {' '}
                  {knowledge.refVidLink && i18n.language === 'ru'
                    ? knowledge.refVidLink.title_ru
                    : i18n.language === 'kg'
                    ? knowledge.refVidLink.title
                    : knowledge.refVidLink.title_en}
                </h2>
              </label>
            </div>
            {knowledgeNamesList()}
          </div>
          <div className="p-grid card">
            <div className="p-col-12 p-md-6 p-lg-12">
              <label htmlFor="ref_type">{t('type') + ': '}</label>
              <label htmlFor="ref_vid">
                {knowledge.refTypeLink && knowledge.refTypeLink.title}
              </label>
            </div>
            <div className="p-col-12 p-md-6 p-lg-12">
              <label htmlFor="incoming_number">{t('incoming_number') + ': '}</label>
              {knowledge.incoming_number}
            </div>
            <div className="p-col-12 p-md-6 p-lg-12">
              <label htmlFor="certificate_number">{t('certificate_number') + ': '}</label>
              {knowledge.certificate_number}
            </div>
            <div className="p-col-12 p-md-6 p-lg-12">
              <label htmlFor="incoming_date">{t('incoming_date') + ': '}</label>
              {incomingDateText()}
            </div>
            <div className="p-col-12 p-md-6 p-lg-12">
              <label htmlFor="certificate_start_date">{t('certificate_start_date') + ': '}</label>
              {certificateStartDateText()}
            </div>
            <div className="p-col-12 p-md-6 p-lg-12">
              <label htmlFor="certificate_end_date">{t('certificate_end_date') + ': '}</label>
              {certificateEndDateText()}
            </div>
            <div className="p-col-12 p-md-6 p-lg-12">
              <label htmlFor="applicant">{t('applicant') + ': '}</label>
              {i18n.language === 'ru'
                ? knowledge.applicant_ru
                : i18n.language === 'kg'
                ? knowledge.applicant
                : knowledge.applicant_en}
            </div>
            <div className="p-col-12 p-md-6 p-lg-12">
              <label htmlFor="owner">{t('owner') + ': '}</label>
              {i18n.language === 'ru'
                ? knowledge.owner_ru
                : i18n.language === 'kg'
                ? knowledge.owner
                : knowledge.owner_en}
            </div>
            <div className="p-col-12 p-md-6 p-lg-12">
              <label htmlFor="correspondence_address">{t('correspondence_address') + ': '}</label>
              {i18n.language === 'ru'
                ? knowledge.correspondence_address_ru
                : i18n.language === 'kg'
                ? knowledge.correspondence_address
                : knowledge.correspondence_address_en}
            </div>
            <div className="p-col-12 p-md-6 p-lg-12">
              <label htmlFor="origin_place">{t('origin_place') + ': '}</label>
              {i18n.language === 'ru'
                ? knowledge.origin_place_ru
                : i18n.language === 'kg'
                ? knowledge.origin_place
                : knowledge.origin_place_en}
            </div>
            <div className="p-col-12 p-md-6 p-lg-12">
              <label htmlFor="region_use">{t('region_use') + ': '}</label>
              {i18n.language === 'ru'
                ? knowledge.region_use_ru
                : i18n.language === 'kg'
                ? knowledge.region_use
                : knowledge.region_use_en}
            </div>
          </div>
          <div className="card">
            <Galleria
              value={knowledge.images}
              responsiveOptions={galleriaResponsiveOptions}
              numVisible={7}
              circular
              style={{ maxWidth: '800px', margin: 'auto' }}
              item={galleriaItemTemplate}
              thumbnail={galleriaThumbnailTemplate}></Galleria>
          </div>
          <div className="card">{videoList()}</div>
        </>
      )}
    </div>
  );

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div style={{ whiteSpace: 'pre-line' }}>
            <Toast ref={toast} />
          </div>
          {knowledgeParamTemplate}
        </div>
      </div>
    </div>
  );
};
