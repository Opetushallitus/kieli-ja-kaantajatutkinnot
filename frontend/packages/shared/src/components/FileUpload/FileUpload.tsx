import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Button } from '@mui/material';
import { ChangeEvent, FC } from 'react';
import './FileUpload.scss';
import { Color, Variant } from '../../enums';

type FileUploadProps = {
  accept?: string;
  error?: boolean;
  onChange: (files: FileList) => void;
  labelText: string;
};

export const FileUpload: FC<FileUploadProps> = ({
  accept,
  onChange,
  error,
  labelText,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onChange(event.target.files);
    }
  };

  return (
    <div
      className={
        error ? 'custom-fileupload file-upload-error' : 'custom-fileupload'
      }
    >
      <Button
        component="label"
        variant={Variant.Contained}
        color={error ? Color.Error : Color.Secondary}
        startIcon={<FileUploadIcon />}
      >
        {labelText}
        <input
          id="custom-fileupload"
          accept={accept}
          type="file"
          onChange={handleChange}
        />
      </Button>
    </div>
  );
};
