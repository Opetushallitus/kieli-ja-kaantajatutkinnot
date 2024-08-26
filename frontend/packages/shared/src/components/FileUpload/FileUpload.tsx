import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Button } from '@mui/material';
import { ChangeEvent, DragEvent, FC } from 'react';

import './FileUpload.scss';
import { Text } from '../../components';
import { Color, Variant } from '../../enums';
import { useWindowProperties } from '../../hooks';

type FileUploadProps = {
  accept?: string;
  error?: boolean;
  onChange: (files: FileList) => void;
  buttonText: string;
  dropZoneText: string;
};

export const FileUpload: FC<FileUploadProps> = ({
  accept,
  onChange,
  error,
  buttonText,
  dropZoneText,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onChange(event.target.files);
    }
  };
  const { isPhone } = useWindowProperties();

  return (
    <div
      className={`columns custom-fileupload ${
        error ? 'file-upload-error' : ''
      }`}
    >
      <Button
        component="label"
        variant={Variant.Contained}
        color={error ? Color.Error : Color.Secondary}
        startIcon={<FileUploadIcon />}
      >
        {buttonText}
        <input
          id="custom-fileupload"
          accept={accept}
          type="file"
          onChange={handleChange}
        />
      </Button>
      {!isPhone && (
        <div
          className="file-dropzone"
          onDragOver={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
          }}
          onDrop={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            onChange(e.dataTransfer.files);
          }}
        >
          <Text>{dropZoneText}</Text>
        </div>
      )}
    </div>
  );
};
