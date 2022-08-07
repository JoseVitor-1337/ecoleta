import { memo, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FiUpload } from "react-icons/fi";

import "./style.css";

interface IDropzoneProps {
  onFileUploaded: (file: File) => void;
}

function Dropzone({ onFileUploaded }: IDropzoneProps) {
  const [selectedFileUrl, setSelectedFileUrl] = useState("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const fileUrl = URL.createObjectURL(file);

      setSelectedFileUrl(fileUrl);

      onFileUploaded(file);
    },
    [onFileUploaded]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} />

      {selectedFileUrl ? (
        <img src={selectedFileUrl} alt="Imagem do ponto" />
      ) : (
        <p>
          <FiUpload />
          Imagem do estabelecimento
        </p>
      )}
    </div>
  );
}

export default memo(Dropzone);
