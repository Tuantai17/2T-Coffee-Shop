import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Autoformat,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  BlockQuote,
  Heading,
  Link,
  List,
  Paragraph,
  Table,
  TableToolbar,
  Image,
  ImageCaption,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  Alignment,
  HorizontalLine,
  RemoveFormat,
  CodeBlock,
  SourceEditing,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import axiosClient from "../../api/axiosClient";

class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          const data = new FormData();
          data.append("file", file);

          axiosClient
            .post("/api/admin/media/images", data, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then((response) => {
              resolve({
                default: response.data.url,
              });
            })
            .catch((error) => {
              console.error("Upload error:", error);
              reject(
                error.response?.data?.message ||
                  "Khong the tai anh len. Vui long thu lai."
              );
            });
        })
    );
  }

  abort() {
    // Abort is omitted for this simple adapter.
  }
}

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) =>
    new MyUploadAdapter(loader);
}

export default function RichTextEditor({ value, onChange, placeholder }) {
  return (
    <div className="rich-text-editor-container">
      <style>{`
        .ck-editor__editable_inline {
          min-height: 400px;
        }

        .ck.ck-editor__main > .ck-editor__editable {
          background: #fff;
          border: 1px solid #dee2e6;
        }

        .ck.ck-toolbar {
          flex-wrap: wrap;
        }
      `}</style>

      <CKEditor
        editor={ClassicEditor}
        config={{
          licenseKey: "GPL",
          placeholder:
            placeholder || "Nhap noi dung chi tiet bai viet tai day...",
          plugins: [
            Essentials,
            Autoformat,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Subscript,
            Superscript,
            BlockQuote,
            Heading,
            Link,
            List,
            Paragraph,
            Table,
            TableToolbar,
            Image,
            ImageCaption,
            ImageInsert,
            ImageInsertViaUrl,
            ImageResize,
            ImageStyle,
            ImageToolbar,
            ImageUpload,
            Indent,
            Alignment,
            HorizontalLine,
            RemoveFormat,
            CodeBlock,
            SourceEditing,
          ],
          toolbar: {
            items: [
              "undo",
              "redo",
              "|",
              "sourceEditing",
              "|",
              "heading",
              "|",
              "bold",
              "italic",
              "underline",
              "strikethrough",
              "subscript",
              "superscript",
              "removeFormat",
              "|",
              "alignment",
              "|",
              "bulletedList",
              "numberedList",
              "|",
              "outdent",
              "indent",
              "|",
              "link",
              "insertImage",
              "blockQuote",
              "codeBlock",
              "insertTable",
              "horizontalLine",
            ],
          },
          image: {
            toolbar: [
              "imageStyle:inline",
              "imageStyle:block",
              "imageStyle:side",
              "resizeImage",
              "|",
              "toggleImageCaption",
              "imageTextAlternative",
            ],
            insert: {
              integrations: ["upload", "url"],
            },
          },
          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
          },
          extraPlugins: [MyCustomUploadAdapterPlugin],
        }}
        data={value || ""}
        onChange={(event, editor) => {
          onChange(editor.getData());
        }}
        onError={(error) => {
          console.error("Editor error:", error);
        }}
      />
    </div>
  );
}
