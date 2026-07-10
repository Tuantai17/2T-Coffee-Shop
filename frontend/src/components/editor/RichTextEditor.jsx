import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor,
    Essentials,
    Autoformat,
    Bold,
    Italic,
    Underline,
    BlockQuote,
    Heading,
    Link,
    List,
    Paragraph,
    Table,
    TableToolbar,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    Indent,
    Alignment,
    HorizontalLine,
    RemoveFormat
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import axiosClient from "../../api/axiosClient";
import { toast } from 'react-hot-toast';

class MyUploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file
            .then(file => new Promise((resolve, reject) => {
                const data = new FormData();
                data.append('file', file);

                axiosClient.post('/api/admin/media/images', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(response => {
                    resolve({
                        default: response.data.url
                    });
                }).catch(error => {
                    console.error("Upload error:", error);
                    reject(error.response?.data?.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
                });
            }));
    }

    abort() {
        // Abort not fully supported with simple axios request unless cancel token is used
    }
}

function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new MyUploadAdapter(loader);
    };
}

export default function RichTextEditor({ value, onChange, placeholder }) {
    return (
        <div className="rich-text-editor-container">
            <style>{`
                .ck-editor__editable_inline {
                    min-height: 400px;
                }
                .ck.ck-editor__main>.ck-editor__editable {
                    background: #fff;
                    border: 1px solid #dee2e6;
                }
            `}</style>
            <CKEditor
                editor={ClassicEditor}
                config={{
                    licenseKey: 'GPL',
                    placeholder: placeholder || 'Nhập nội dung chi tiết bài viết tại đây...',
                    plugins: [
                        Essentials, Autoformat, Bold, Italic, Underline, BlockQuote,
                        Heading, Link, List, Paragraph, Table, TableToolbar,
                        Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload,
                        Indent, Alignment, HorizontalLine, RemoveFormat
                    ],
                    toolbar: {
                        items: [
                            'undo', 'redo', '|',
                            'heading', '|',
                            'bold', 'italic', 'underline', 'strikethrough', 'removeFormat', '|',
                            'alignment', '|',
                            'bulletedList', 'numberedList', '|',
                            'outdent', 'indent', '|',
                            'link', 'uploadImage', 'blockQuote', 'insertTable', 'horizontalLine'
                        ]
                    },
                    image: {
                        toolbar: [
                            'imageStyle:inline',
                            'imageStyle:block',
                            'imageStyle:side',
                            '|',
                            'toggleImageCaption',
                            'imageTextAlternative'
                        ]
                    },
                    table: {
                        contentToolbar: [
                            'tableColumn',
                            'tableRow',
                            'mergeTableCells'
                        ]
                    },
                    extraPlugins: [MyCustomUploadAdapterPlugin]
                }}
                data={value || ''}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    onChange(data);
                }}
                onError={(error, { willEditorRestart }) => {
                    console.error('Editor error:', error);
                }}
            />
        </div>
    );
}
