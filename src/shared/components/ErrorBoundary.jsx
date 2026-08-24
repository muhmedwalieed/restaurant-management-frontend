import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button.jsx';

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
          <div className="bg-bg-surface border border-border-default rounded-lg p-6 max-w-md w-full text-center space-y-4">
            <AlertTriangle className="w-6 h-6 text-status-danger mx-auto" />
            <h2 className="text-xl font-semibold text-txt-primary">
              حدث خطأ غير متوقع في الواجهة
            </h2>
            <p className="text-sm text-txt-muted leading-relaxed">
              تعذّر عرض هذه الصفحة بشكل صحيح. يمكنك المحاولة مجددًا أو العودة للرئيسية.
            </p>
            <div className="pt-2">
              <Button onClick={this.handleReset} icon={RefreshCw}>
                إعادة تحضير الصفحة
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
