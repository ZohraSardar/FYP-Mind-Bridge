import React from 'react';

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold">404 Page Not Found</h1>
      <p className="mt-2">Did you forget to add the page to the router?</p>
    </div>
  );
};

export default NotFound;