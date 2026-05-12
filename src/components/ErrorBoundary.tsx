import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      try {
        if (this.state.error?.message) {
          try {
            const parsed = JSON.parse(this.state.error.message);
            if (parsed.operationType) {
              errorMessage = `Firestore Error (${parsed.operationType})${parsed.path ? `: ${parsed.path}` : ''}`;
              
              // Optionally add the actual error message below it if it exists
              if (parsed.error && !parsed.error.includes('Missing or insufficient permissions')) {
                 console.warn('Original Firestore Error:', parsed.error);
              }
            } else if (parsed.error) {
              errorMessage = parsed.error;
            } else {
              errorMessage = this.state.error.message;
            }
          } catch {
            errorMessage = this.state.error.message;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-noir-border/40 bg-black/40 p-8 shadow-xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white">
              <AlertCircle size={32} />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">Something went wrong</h2>
            <p className="mb-8 text-sm text-zinc-400 break-words">{errorMessage}</p>
            <Button onClick={() => window.location.reload()} className="w-full bg-black/60 hover:bg-zinc-800 text-white">
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
