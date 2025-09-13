export const testDirectApi = async () => {
  const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzOTJkMmM5YzFkZWQyMDE5NzhlNmM2OGRkOTE0ODRiNyIsInN1YiI6IjY3ZWYwODA0OGIxZjMyZWI3OWQ5MGJmNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.aLnGmVL33bEMlRb7_tgWqc0NH2GogoMplaTt4KLA6ts';
  const API_KEY = '392d2c9c1ded201978e6c68dd91484b7';
  
  const testEndpoints = [
    'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1',
    'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1'
  ];

  const headers = {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json;charset=utf-8',
    'Accept': 'application/json'
  };

  for (const url of testEndpoints) {
    console.log(`\nTesting endpoint: ${url}`);
    try {
      // Test with Bearer token
      console.log('Testing with Bearer token...');
      const response1 = await fetch(url, { headers });
      const data1 = await response1.json();
      console.log(`Status: ${response1.status}`, data1);
      
      // Test with API key
      console.log('\nTesting with API key...');
      const response2 = await fetch(`${url}${url.includes('?') ? '&' : '?'}api_key=${API_KEY}`);
      const data2 = await response2.json();
      console.log(`Status: ${response2.status}`, data2);
      
    } catch (error) {
      console.error('Error:', error);
    }
  }
};

// testDirectApi();
