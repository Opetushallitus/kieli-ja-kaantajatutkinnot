import { ChangeEvent, FC } from 'react';
import './FileUpload.scss';

type FileUploadProps = {
  onChange: (files: FileList) => void;
};

export const FileUpload: FC<FileUploadProps> = ({ onChange }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onChange(event.target.files);
    }
  };

  return (
    <div className="custom-fileupload">
      <div className="rows gapped">
        <input type="file" onChange={handleChange} />
      </div>
    </div>
  );
};
