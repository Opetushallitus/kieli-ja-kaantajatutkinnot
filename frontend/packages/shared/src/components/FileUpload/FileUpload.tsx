import { ChangeEvent, FC } from 'react';
import './FileUpload.scss';

type FileUploadProps = {
  accept?: string;
  onChange: (files: FileList) => void;
};

export const FileUpload: FC<FileUploadProps> = ({ accept, onChange }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onChange(event.target.files);
    }
  };

  return (
    <div className="custom-fileupload">
      <div className="rows gapped">
        <input accept={accept} type="file" onChange={handleChange} />
      </div>
    </div>
  );
};
