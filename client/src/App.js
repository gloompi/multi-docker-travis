import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});
  const [index, setIndex] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    await axios.post('/api/values', { index });
    setIndex('');
  };

  useEffect(() => {
    const fetchValues = async () => {
      const values = await axios.get('/api/values/current');
      setValues(values.data);
    };

    const fetchIndexes = async () => {
      const seenIndexes = await axios.get('/api/values/all');
      setSeenIndexes(seenIndexes.data);
    };

    fetchValues();
    fetchIndexes();
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter your index:</label>
        <input
          value={index}
          onChange={event => setIndex(event.target.value)}
        />
        <button type="submit">Submit</button>
        <h3>Indexes I have seen</h3>
        {seenIndexes.map(({ number }) => number).join(', ')}

        <h3>Calculated Values:</h3>
        {Object.entries(values).map(([key, value]) => (
          <div key={key}>
            For index {key} I calculated {value}
          </div>
        ))}
      </form>
    </div>
  );
};

export default App;
