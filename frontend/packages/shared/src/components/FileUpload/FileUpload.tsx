import { ChangeEvent, FC } from 'react';

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
