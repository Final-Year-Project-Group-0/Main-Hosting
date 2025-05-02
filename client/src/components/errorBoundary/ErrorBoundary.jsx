import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorBoundary.scss';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="error-boundary">
          <div className="error-content">
            <h1>Something went wrong</h1>
            <p>We're sorry, but there was an error loading this page.</p>
            
            <div className="error-details">
              <p className="error-message">{this.state.error?.toString()}</p>
              {process.env.NODE_ENV === 'development' && (
                <details>
                  <summary>Error Details</summary>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </details>
              )}
            </div>
            
            <div className="error-actions">
              <button onClick={() => window.location.reload()}>
                Refresh Page
              </button>
              <Link to="/" className="home-link">
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;