import YoutubeTranscript from 'youtube-transcript';
const id = process.argv[2];
YoutubeTranscript.default.fetchTranscript(id)
  .then(t => console.log(`--- TRANSCRIPT FOR ${id} ---\n` + t.map(i => i.text).join(' ')))
  .catch(e => {
    // maybe default is wrong, try directly
    YoutubeTranscript.fetchTranscript(id)
      .then(t => console.log(`--- TRANSCRIPT FOR ${id} ---\n` + t.map(i => i.text).join(' ')))
      .catch(e => console.log('No transcript available for', id));
  });
