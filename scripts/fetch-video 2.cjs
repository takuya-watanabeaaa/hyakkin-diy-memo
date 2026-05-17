const { YoutubeTranscript } = require('youtube-transcript');
const id = process.argv[2];
YoutubeTranscript.fetchTranscript(id)
  .then(t => console.log(`--- TRANSCRIPT FOR ${id} ---\n` + t.map(i => i.text).join(' ')))
  .catch(e => console.log('No transcript available for', id));
