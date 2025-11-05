import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchEBooks } from '../store/ebookSlice';

const EBooks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { ebooks, loading, error } = useSelector((state: RootState) => state.ebooks);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchEBooks({}));
  }, [dispatch]);

  const filteredEBooks = ebooks.filter((ebook) =>
    ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ebook.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ebook.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">eBooks</h1>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search eBooks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* eBook Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredEBooks.map((ebook) => (
          <Link
            key={ebook._id}
            to={`/ebooks/${ebook._id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={ebook.coverImage}
              alt={ebook.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1 truncate">{ebook.title}</h3>
              <p className="text-gray-600 text-sm mb-2">by {ebook.author}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-indigo-600">
                  ${ebook.price}
                </span>
                <span className="text-sm text-gray-500">
                  {ebook.pages} pages
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredEBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No eBooks found</p>
        </div>
      )}
    </div>
  );
};

export default EBooks;
