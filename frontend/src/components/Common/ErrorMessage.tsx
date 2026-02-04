interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between">
      <span className="text-sm">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-500 hover:text-red-700 ml-2">
          &times;
        </button>
      )}
    </div>
  );
}
