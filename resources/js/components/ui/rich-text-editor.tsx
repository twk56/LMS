import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'เริ่มพิมพ์เนื้อหาของคุณ...',
  height = 400,
  disabled = false 
}: RichTextEditorProps) {
  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="rich-text-editor">
      <Editor
        apiKey="your-tinymce-api-key" // ใช้ free version หรือใส่ API key ของคุณ
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | link image | help',
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              font-size: 14px; 
              line-height: 1.6; 
              color: #374151; 
              margin: 0; 
              padding: 16px; 
            }
            h1, h2, h3, h4, h5, h6 { 
              margin-top: 24px; 
              margin-bottom: 16px; 
              font-weight: 600; 
              line-height: 1.25; 
            }
            h1 { font-size: 2em; }
            h2 { font-size: 1.5em; }
            h3 { font-size: 1.25em; }
            h4 { font-size: 1em; }
            h5 { font-size: 0.875em; }
            h6 { font-size: 0.85em; }
            p { margin: 0 0 16px 0; }
            ul, ol { margin: 0 0 16px 0; padding-left: 24px; }
            li { margin: 0 0 8px 0; }
            blockquote { 
              margin: 0 0 16px 0; 
              padding: 0 16px; 
              color: #6b7280; 
              border-left: 4px solid #e5e7eb; 
            }
            code { 
              background-color: #f3f4f6; 
              padding: 2px 4px; 
              border-radius: 4px; 
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
              font-size: 0.875em; 
            }
            pre { 
              background-color: #f3f4f6; 
              padding: 16px; 
              border-radius: 8px; 
              overflow-x: auto; 
              margin: 0 0 16px 0; 
            }
            pre code { 
              background-color: transparent; 
              padding: 0; 
            }
            img { 
              max-width: 100%; 
              height: auto; 
              border-radius: 8px; 
              margin: 16px 0; 
            }
            a { 
              color: #3b82f6; 
              text-decoration: underline; 
            }
            a:hover { 
              color: #2563eb; 
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin: 16px 0; 
            }
            th, td { 
              border: 1px solid #e5e7eb; 
              padding: 8px 12px; 
              text-align: left; 
            }
            th { 
              background-color: #f9fafb; 
              font-weight: 600; 
            }
          `,
          placeholder: placeholder,
          branding: false,
          elementpath: false,
          resize: false,
          statusbar: false,
          paste_data_images: true,
          images_upload_url: '/api/upload-image', // จะสร้าง API endpoint สำหรับอัปโหลดรูปภาพ
          images_upload_handler: (blobInfo: any, progress: any) => {
            return new Promise((resolve, reject) => {
              const formData = new FormData();
              formData.append('image', blobInfo.blob(), blobInfo.filename());
              
              fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
                headers: {
                  'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
              })
              .then(response => response.json())
              .then(result => {
                if (result.location) {
                  resolve(result.location);
                } else {
                  reject('Upload failed');
                }
              })
              .catch(error => {
                reject(error);
              });
            });
          },
          setup: (editor) => {
            editor.on('init', () => {
              if (disabled) {
                editor.setMode('readonly');
              }
            });
          },
        }}
        disabled={disabled}
      />
    </div>
  );
} 