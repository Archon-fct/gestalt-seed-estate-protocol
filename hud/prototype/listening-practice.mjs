const audio = document.getElementById('aura-listening-audio');
if (audio) {
  // Prerecorded score rendered locally. It never reads from the microphone.
  const rate = 16000;
  const samples = new Int16Array(42 * rate);
  for (const [frequency, time, duration] of [[220,3,4],[330,5,4],[220,29,3],[880/3,31,3],[220,34,3]]) {
    for (let i = 0; i < duration * rate; i++) {
      const t = i / rate;
      const envelope = Math.sin(Math.PI * t / duration) ** 2;
      samples[time * rate + i] += Math.round(1350 * envelope * Math.sin(2 * Math.PI * frequency * t));
    }
  }
  const wav = new DataView(new ArrayBuffer(44 + samples.byteLength));
  const write = (at, value) => [...value].forEach((letter, i) => wav.setUint8(at + i, letter.charCodeAt(0)));
  write(0, 'RIFF'); wav.setUint32(4, wav.byteLength - 8, true); write(8, 'WAVEfmt ');
  wav.setUint32(16, 16, true); wav.setUint16(20, 1, true); wav.setUint16(22, 1, true);
  wav.setUint32(24, rate, true); wav.setUint32(28, rate * 2, true);
  wav.setUint16(32, 2, true); wav.setUint16(34, 16, true);
  write(36, 'data'); wav.setUint32(40, samples.byteLength, true);
  samples.forEach((value, i) => wav.setInt16(44 + i * 2, value, true));
  const url = URL.createObjectURL(new Blob([wav.buffer], {type:'audio/wav'}));
  audio.src = url;
  document.addEventListener('visibilitychange', () => { if (document.hidden) audio.pause(); });
  window.addEventListener('pagehide', event => {
    audio.pause();
    if (!event.persisted) URL.revokeObjectURL(url);
  });
}
