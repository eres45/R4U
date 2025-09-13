import api from '../config/tmdb';

const testApiConnection = async () => {
  try {
    console.log('Testing TMDb API connection...');
    
    // Test popular movies endpoint
    const popular = await api.getPopularMovies(1);
    console.log('✅ Successfully fetched popular movies');
    console.log(`Found ${popular.results.length} movies`);
    
    // Test movie details endpoint
    if (popular.results.length > 0) {
      const movieId = popular.results[0].id;
      const details = await api.getMovieDetails(movieId);
      console.log(`✅ Successfully fetched details for movie: ${details.title}`);
    }
    
    console.log('\n🎉 TMDb API connection test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing TMDb API:', error);
    console.error('Please check your API key and network connection.');
  }
};

testApiConnection();
