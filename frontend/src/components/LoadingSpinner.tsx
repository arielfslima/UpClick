interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div
        className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`}
      ></div>
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
