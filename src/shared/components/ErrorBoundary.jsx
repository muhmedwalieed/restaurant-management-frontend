import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught Error Boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-border-default rounded-lg p-6 max-w-md w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-status-danger-bg text-status-danger flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-txt-primary">
              حدث خطأ غير متوقع في الواجهة
            </h2>
            <p className="text-sm text-txt-muted leading-relaxed">
              تعذّر عرض هذه الصفحة بشكل صحيح. يمكنك المحاولة مجددًا أو العودة للرئيسية.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md bg-brand-primary text-txt-inverted font-medium hover:bg-brand-primary-hover transition-colors focus-visible:outline-none"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة تحضير الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
