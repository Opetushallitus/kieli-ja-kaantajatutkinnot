import { ChangeEvent, FC } from 'react';
import './FileUpload.scss';

type FileUploadProps = {
  accept?: string;
  error?: boolean;
  onChange: (files: FileList) => void;
};

export const FileUpload: FC<FileUploadProps> = ({ accept, onChange, error }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onChange(event.target.files);
    }
  };

  return (
    <div className={`custom-fileupload ${error && 'file-upload-error'}`}>
      <div className="rows gapped">
        <input accept={accept} type="file" onChange={handleChange} />
      </div>
    </div>
  );
};
