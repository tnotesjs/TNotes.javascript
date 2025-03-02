channel.port1.onmessage = (event) => {
  console.log('Received message from index2.js');
  console.log('event.data:', event.data)
};