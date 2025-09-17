import React, { useState, useEffect } from 'react';

// You can use the environment variable as a security best practice
const GNEWS_API_KEY = process.env.REACT_APP_GNEWS_API_KEY || '409cf7045abd13a5c18771e37e6519ca';
const query = 'carbon footprint';
const GNEWS_API_URL = `https://gnews.io/api/v4/search?q=${query}&token=${GNEWS_API_KEY}&lang=en`;

function News({ darkMode }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(GNEWS_API_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch news. Please check your API key and network connection.');
        }
        const data = await response.json();
        setArticles(data.articles);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <p className="text-center mt-8">Loading news...</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-500">Error: {error}</p>;
  }

  return (
    <div className={`p-4 ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <h1 className="text-2xl font-bold mb-4">Latest Carbon Footprint News</h1>
      
     {/* New container for reduced width */}
      <div className="max-w-2xl mx-auto">
        {articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article, index) => (
              <div 
                key={index} 
                className="p-4 border border-gray-200 rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 dark:border-gray-700 transition-transform hover:scale-[1.01]"
              >
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.image && (
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-48 object-cover rounded-md mb-2" 
                    />
                  )}
                  <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{article.description}</p>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">No news articles found.</p>
        )}
      </div>
    </div>
  );
}

export default News;