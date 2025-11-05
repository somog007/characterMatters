import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchEBook, purchaseEBook, clearCurrentEBook } from '../store/ebookSlice';

const EBookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentEBook, loading, error } = useSelector((state: RootState) => state.ebooks);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchEBook(id));
    }
    return () => {
      dispatch(clearCurrentEBook());
    };
  }, [id, dispatch]);

  const handlePurchase = async () => {
    if (!id) return;
    
    setPurchasing(true);
    try {
      await dispatch(purchaseEBook(id)).unwrap();
      alert('eBook purchased successfully!');
      // You might want to redirect to a download page or show the download link
    } catch (err) {
      console.error('Purchase failed:', err);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate('/ebooks')}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          ← Back to eBooks
        </button>
      </div>
    );
  }

  if (!currentEBook) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-500">eBook not found</p>
        <button
          onClick={() => navigate('/ebooks')}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          ← Back to eBooks
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/ebooks')}
        className="mb-4 text-indigo-600 hover:text-indigo-500 flex items-center"
      >
        ← Back to eBooks
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Cover Image */}
            <div className="md:w-1/3">
              <img
                src={currentEBook.coverImage}
                alt={currentEBook.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="md:w-2/3 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentEBook.title}
              </h1>
              <p className="text-xl text-gray-600 mb-4">by {currentEBook.author}</p>

              <div className="flex items-center mb-6">
                <span className="text-3xl font-bold text-indigo-600">
                  ${currentEBook.price}
                </span>
              </div>

              <div className="mb-6 space-y-2">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{currentEBook.pages} pages</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Publisher: {currentEBook.publisher}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Published: {new Date(currentEBook.publishedDate).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {purchasing ? 'Processing...' : 'Purchase eBook'}
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="p-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {currentEBook.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EBookDetail;
