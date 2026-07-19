(function() {
    const audio = document.getElementById('bg-music');
    const btn = document.getElementById('musicToggle');
    const progress = document.getElementById('player-progress');
    const currentTime = document.getElementById('player-current');
    const totalTime = document.getElementById('player-total');
    const playBtn = document.getElementById('player-play');
    const trackName = document.getElementById('player-track-name');
    const trackArtist = document.getElementById('player-track-artist');
    const prevBtn = document.getElementById('player-prev');
    const nextBtn = document.getElementById('player-next');
    let playlist = window.__playlist || [];
    let currentIndex = 0;
    let isPlaying = false;
    let audioCtx, analyser, dataArray, srcNode;
    let retryTimer = null;

    if (!playlist.length) {
        playlist = [{ src: 'ЧВ, feelinsomnia - Свет в окнах вселенной.mp3', name: 'Свет в окнах вселенной', artist: 'ЧВ, feelinsomnia' }];
    }

    function initAudioContext() {
        if (audioCtx) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            return;
        }
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            srcNode = audioCtx.createMediaElementSource(audio);
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            srcNode.connect(analyser);
            analyser.connect(audioCtx.destination);
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            window.__audioAnalyser = analyser;
            window.__audioData = dataArray;
        } catch (e) { console.warn('AudioContext init failed:', e); }
    }

    function getAudioBoost() {
        if (!analyser || !dataArray) return 0;
        try { analyser.getByteFrequencyData(dataArray); } catch(e) { return 0; }
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        return Math.min(1, sum / (dataArray.length * 255) * 3);
    }
    window.__getAudioBoost = getAudioBoost;

    function updatePlayerUI() {
        if (!audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        if (progress) progress.style.width = pct + '%';
        if (currentTime) currentTime.textContent = formatTime(audio.currentTime);
        if (totalTime) totalTime.textContent = formatTime(audio.duration);
    }

    function formatTime(s) {
        if (!isFinite(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function updateTrackInfo() {
        const track = playlist[currentIndex];
        if (trackName) trackName.textContent = track.name;
        if (trackArtist) trackArtist.textContent = track.artist;
    }

    function loadTrack(index) {
        if (index < 0) index = playlist.length - 1;
        if (index >= playlist.length) index = 0;
        currentIndex = index;
        const track = playlist[currentIndex];
        audio.src = track.src;
        audio.load();
        updateTrackInfo();
        if (isPlaying) {
            audio.play().catch(function(e) { console.warn('play failed:', e); });
        }
        if (progress) progress.style.width = '0%';
        if (currentTime) currentTime.textContent = '0:00';
        if (totalTime) totalTime.textContent = '0:00';
    }

    window.playTrack = function(index) { loadTrack(index); };

    window.nextTrack = function() {
        loadTrack(currentIndex + 1);
    };

    window.prevTrack = function() {
        loadTrack(currentIndex - 1);
    };

    window.toggleMusic = function() {
        if (isPlaying) {
            audio.pause();
            setPlayingUI(false);
            if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
        } else {
            initAudioContext();
            audio.play().then(function() {
                setPlayingUI(true);
                if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
            }).catch(function(e) {
                isPlaying = false;
                console.warn('play blocked, retrying...', e);
                if (retryTimer) clearTimeout(retryTimer);
                retryTimer = setTimeout(function() {
                    audio.play().then(function() {
                        setPlayingUI(true);
                        retryTimer = null;
                    }).catch(function() {});
                }, 500);
            });
        }
        isPlaying = !isPlaying;
    };

    function setPlayingUI(state) {
        if (btn) {
            btn.classList.toggle('playing', state);
            btn.textContent = state ? '♫' : '♪';
        }
        if (playBtn) playBtn.textContent = state ? '⏸' : '▶';
    }

    function seek(e) {
        const bar = document.getElementById('player-bar');
        if (!bar || !audio.duration) return;
        const rect = bar.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.currentTime = pct * audio.duration;
    }

    audio.addEventListener('timeupdate', updatePlayerUI);
    audio.addEventListener('loadedmetadata', function() {
        if (totalTime) totalTime.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('ended', function() {
        nextTrack();
    });

    window.seekMusic = seek;
    window.playerPlay = function() { toggleMusic(); };

    updateTrackInfo();
})();
