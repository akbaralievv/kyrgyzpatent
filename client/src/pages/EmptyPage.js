import React, { useState } from 'react';
import { Editor } from 'primereact/editor';
import { Button } from 'primereact/button';
import { Galleria } from 'primereact/galleria';
import { FileUpload } from 'primereact/fileupload';
import { DataTable } from 'primereact/datatable';
import { TabView, TabPanel } from 'primereact/tabview';
import { Column } from 'primereact/column';
import {} from 'quill';
import Quill from 'quill/core';

import VideoPlayer from 'react-video-js-player';
import Dropzone from 'react-dropzone';

import { KnowledgeServices } from '../services/KnowledgeServices';

import { useTranslation } from 'react-i18next';

const EmptyPage = () => {
  const { error, clearError, loading, token, uploadVideo } = KnowledgeServices();

  const { t, i18n } = useTranslation();
  const testSrc = '/2.MP4';

  const [text1, setText1] = useState('');

  const renderHeader = () => {
    return <></>;
  };
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

  const header = renderHeader();
  const [uploadedImages, setUploadedImages] = useState(null);
  const [images, setImages] = useState(null);
  const galleriaItemTemplate = (item) => (
    <img src={'/' + item.originalname} style={{ width: '100%', display: 'block' }} />
  );
  const galleriaThumbnailTemplate = (item) => (
    <img src={'/' + item.originalname} style={{ width: '100%', display: 'block' }} />
  );
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

  const onUpload = async (acceptedFiles) => {
    try {
      let imageData = [];
      acceptedFiles.forEach(async (img) => {
        let formData = new FormData();
        formData.append('file', img);
        const data = await uploadVideo(formData);

        imageData.push(data.file);
      });
      setUploadedImages(imageData);
    } catch (e) {}
  };

  return (
    <>
      {/* <div className='card'>
                <Dropzone onDrop={acceptedFiles => onUpload(acceptedFiles)}>
                    {({ getRootProps, getInputProps }) => (
                        <section>
                            <div {...getRootProps()} className='pi pi-book'>
                                <input {...getInputProps()} />
                                <p>Drag 'n' drop some files here, or click to select files</p>
                                
                                <Button label='add to do'></Button>
                            </div>
                        </section>
                    )}
                </Dropzone>
                <DataTable
                                    value={images}
                                    emptyMessage={t('list_empty')}
                                    header={false}
                                >
                                    <Column field={'name'} style={{ minWidth: '20px' }} />
                                    <Column field={'size'} style={{ minWidth: '20px' }} />
                                </DataTable>
            </div>
            <Button className="p-text-center"
                onClick={onUpload}
                // disabled={loading}
                label={'upload'}
            />
            {/* <FileUpload
                        mode="basic"
                        chooseLabel="Обновить лого"
                        name="file"
                        url={`../api/knowledges/upload/image`}
                        onBeforeSend={onUploadDocuments}
                        //accept="video/*"
                        // maxFileSize={1000000}
                        onUpload={(e) => alert('adfasdf')}
                        auto /> */}

      {/* 
            <div className="col-12">
                <div className="card">
                    <h5>Galleria</h5>
                    <Galleria value={uploadedImages}
                        responsiveOptions={galleriaResponsiveOptions}
                        numVisible={7} circular style={{ maxWidth: '800px', margin: 'auto' }}
                        item={galleriaItemTemplate} thumbnail={galleriaThumbnailTemplate}></Galleria>
                </div>
            </div> */}

      {/* <VideoPlayer src={testSrc} height="420px" width="720px" /> */}
      {/* <TabView>
                    <TabPanel header="Упращенный поиск">
                       
                        </TabPanel>
                    <TabPanel header="Расширенный поиск">
                       </TabPanel>
                   
                </TabView> */}

      <div id="editor">
        <div className="p-editor-container">
          <div className="p-editor-toolbar">
            <div className="p-editor-content">
              <div dangerouslySetInnerHTML={{ __html: text1 }} />

              <Editor
                modules={{ toolbar: toolbarOptions }}
                style={{ height: '320px' }}
                value={text1}
                theme="snow"
                headerTemplate={header}
                onTextChange={(e) => setText1(e.htmlValue)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const comparisonFn = function (prevProps, nextProps) {
  // return prevProps.location.pathname === nextProps.location.pathname;
};

export default React.memo(EmptyPage, comparisonFn);
