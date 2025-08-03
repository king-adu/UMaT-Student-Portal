import React from 'react';
import { FaNewspaper, FaPlus } from 'react-icons/fa';

const AdminNews = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaNewspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">News Management</h2>
          <p className="text-gray-600 mb-6">
            Create, edit, and manage departmental news posts with image uploads.
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            <FaPlus className="h-4 w-4 mr-2" />
            Create News Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNews; 