import React from 'react';

interface BaseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface EditButtonProps extends BaseButtonProps {
  children?: React.ReactNode;
}

interface DeleteButtonProps extends BaseButtonProps {
  children?: React.ReactNode;
}

interface SaveButtonProps extends BaseButtonProps {
  children?: React.ReactNode;
}

interface CancelButtonProps extends BaseButtonProps {
  children?: React.ReactNode;
}

// Centralized Edit Button - Consistent blue outlined styling
export const EditButton: React.FC<EditButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  size = 'sm',
  className = '',
  children
}) => {
  const baseClasses = `btn btn-outline-primary btn-${size}`;
  const finalClasses = `${baseClasses} ${className}`.trim();

  return (
    <button
      className={finalClasses}
      onClick={onClick}
      disabled={disabled || loading}
      type="button"
    >
      {loading ? (
        <>
          <div className="spinner-border spinner-border-sm me-1" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          {children || 'Edit'}
        </>
      ) : (
        <>
          <i className="bi bi-pencil me-1"></i>
          {children || 'Edit'}
        </>
      )}
    </button>
  );
};

// Centralized Delete Button - Consistent red outlined styling
export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  size = 'sm',
  className = '',
  children
}) => {
  const baseClasses = `btn btn-outline-danger btn-${size}`;
  const finalClasses = `${baseClasses} ${className}`.trim();

  return (
    <button
      className={finalClasses}
      onClick={onClick}
      disabled={disabled || loading}
      type="button"
    >
      {loading ? (
        <>
          <div className="spinner-border spinner-border-sm me-1" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          {children || 'Delete'}
        </>
      ) : (
        <>
          <i className="bi bi-trash me-1"></i>
          {children || 'Delete'}
        </>
      )}
    </button>
  );
};

// Centralized Save Button - Consistent green filled styling
export const SaveButton: React.FC<SaveButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  size = 'sm',
  className = '',
  children
}) => {
  const baseClasses = `btn btn-success btn-${size}`;
  const finalClasses = `${baseClasses} ${className}`.trim();

  return (
    <button
      className={finalClasses}
      onClick={onClick}
      disabled={disabled || loading}
      type="button"
    >
      {loading ? (
        <>
          <div className="spinner-border spinner-border-sm me-1" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          {children || 'Save'}
        </>
      ) : (
        <>
          <i className="bi bi-check-circle me-1"></i>
          {children || 'Save'}
        </>
      )}
    </button>
  );
};

// Centralized Cancel Button - Consistent secondary styling
export const CancelButton: React.FC<CancelButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  size = 'sm',
  className = '',
  children
}) => {
  const baseClasses = `btn btn-secondary btn-${size}`;
  const finalClasses = `${baseClasses} ${className}`.trim();

  return (
    <button
      className={finalClasses}
      onClick={onClick}
      disabled={disabled || loading}
      type="button"
    >
      {loading ? (
        <>
          <div className="spinner-border spinner-border-sm me-1" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          {children || 'Cancel'}
        </>
      ) : (
        <>
          <i className="bi bi-x-circle me-1"></i>
          {children || 'Cancel'}
        </>
      )}
    </button>
  );
};