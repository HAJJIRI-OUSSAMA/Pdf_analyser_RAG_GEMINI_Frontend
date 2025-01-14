import React, { useState } from 'react';
import axios from 'axios';
import { Upload, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';


function RagChat() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      setError('Please enter a query before submitting.');
      return;
    }
    
    setLoading(true);
    setError('');
    setResponse('');
    
    try {
      // Log the request being sent
      console.log('Sending request with query:', query);
      
      const res = await axios.post(
        'http://localhost:8084/api/rag/chat',
        { query: query },
        {
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        }
      );
      
      // Log the raw response for debugging
      console.log('Raw response:', res.data);

      // Handle different response formats
      if (res.data) {
        if (typeof res.data === 'string') {
          setResponse(res.data);
        } else if (res.data.text) {
          setResponse(res.data.text);
        } else if (res.data.response) {
          setResponse(res.data.response);
        } else if (res.data.message) {
          setResponse(res.data.message);
        } else if (typeof res.data === 'object') {
          // If it's an object but doesn't match expected format, stringify it
          setResponse(JSON.stringify(res.data, null, 2));
        }
      } else {
        throw new Error('Empty response received');
      }
    } catch (error) {
      console.error('Full error object:', error);
      
      let errorMessage = 'An error occurred while processing your request.';
      
      if (error.response) {
        console.log('Error response data:', error.response.data);
        errorMessage = error.response.data?.message || 
                      error.response.data || 
                      error.message || 
                      'Server error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploadLoading(true);
    setError('');

    try {
      console.log('Uploading file:', file.name);
      const res = await axios.post(
        'http://localhost:8084/api/documents/upload',
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      
      console.log('Upload response:', res.data);
      setUploadStatus('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data || 'Error uploading file');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-6 pb-2">
          <h1 className="text-5xl pb-4 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            RagQueryAPI
          </h1>
          <p className="text-lg text-gray-600">
            Unlock insights from your documents with AI-powered queries
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 transform transition-all hover:scale-[1.02]">
            <div className="flex items-center space-x-3 mb-6">
              <Upload className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Upload Document</h2>
            </div>
            
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer hover:border-blue-500"
                />
              </div>
              
              <button
                type="submit"
                disabled={uploadLoading}
                className={`w-full p-4 rounded-xl font-semibold text-white transition-all ${
                  uploadLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {uploadLoading ? "Uploading..." : "Upload PDF"}
              </button>
              
              {uploadStatus && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <p className="font-medium">{uploadStatus}</p>
                </div>
              )}
            </form>
          </div>

          {/* Query Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 transform transition-all hover:scale-[1.02]">
            <div className="flex items-center space-x-3 mb-6">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">Ask a Question</h2>
            </div>
            
            <div className="space-y-4">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What would you like to know about your documents?"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none text-gray-700"
                rows="4"
              />
              
              <button
                onClick={handleQuerySubmit}
                disabled={loading}
                className={`w-full p-4 rounded-xl font-semibold text-white transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? "Processing..." : "Submit Query"}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl animate-fade-in">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Response Section */}
        {response && (
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Response</h2>
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RagChat;
