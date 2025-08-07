import React, { useRef, useCallback } from 'react';

interface UploadButtonProps {
  id: string;
  labelContent: React.ReactNode;
  accept: string;
  onFileSelected: (file: File | null) => void;
  className?: string;
}

export default function UploadButton({
  id,
  labelContent,
  accept,
  onFileSelected,
  className = ''
}: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
    if (onFileSelected) {
      onFileSelected(file);
    }
    // Clear the file input value to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onFileSelected]);

  return (
    <label htmlFor={id} className={`icon-file-button ${className}`}>
      {labelContent}
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-label={typeof labelContent === 'string' ? labelContent : 'File upload'}
      />
    </label>
  );
}
