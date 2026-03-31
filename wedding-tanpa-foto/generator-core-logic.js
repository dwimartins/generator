/**
 * ============================================================================
 * CORE LOGIC GENERATOR UNDANGAN DIGITAL
 * ============================================================================
 * File ini berisi sekumpulan fungsi murni (logic) yang digunakan di seluruh
 * tema undangan (Emas, Baby Blue, White Brown, dll).
 * * Tujuan: 
 * 1. Menghindari penulisan kode berulang di setiap file HTML generator.
 * 2. Memudahkan maintenance (ubah 1 file, semua tema ter-update).
 * 3. Memisahkan logika (mesin) dari antarmuka (desain/UI).
 * ============================================================================
 */

window.SistemLogika = {
    
    // ==========================================
    // MODUL 1: LOGIKA RSVP & KEAMANAN
    // ==========================================
    RSVP: {
        getScript: function(brideId, isDemoMode, isSpamFilterOn) {
            if (isDemoMode) {
                return `
                document.addEventListener('click', function(e) {
                    if(e.target.closest('#btn-preview-kirim')) {
                        e.preventDefault();
                        if(typeof window.showModal === 'function') {
                            window.showModal(
                                "Mode Demo", 
                                "Maaf, RSVP dan ucapan tidak dapat dikirim karena ini adalah versi demo/preview tema.", 
                                [{text:"Mengerti", color:"bg-gray-600 text-white", action:"tutupModal()"}]
                            );
                        } else { alert("Mode Demo Aktif: Pesan tidak dapat dikirim."); }
                    }
                });`;
            } 
            
            if (isSpamFilterOn) {
                return `
                document.addEventListener('click', function(e) {
                    if(e.target.closest('#btn-preview-kirim')) {
                        e.preventDefault();
                        const inputNama = document.getElementById('input-nama'); 
                        const inputUcapan = document.getElementById('input-ucapan'); 
                        const inputKehadiran = document.getElementById('input-kehadiran');
                        
                        const namaVal = inputNama ? inputNama.value.trim() : ''; 
                        const ucapanVal = inputUcapan ? inputUcapan.value.trim() : ''; 
                        const kehadiranVal = inputKehadiran ? inputKehadiran.value : '';
                        
                        if (!namaVal || !ucapanVal || !kehadiranVal) { 
                            window.showModal("Peringatan", "Mohon lengkapi semua kolom form RSVP terlebih dahulu.", [{text:"Mengerti", color:"bg-gray-600 text-white", action:"tutupModal()"}]); 
                            return; 
                        }
                        
                        if(localStorage.getItem('rsvp_${brideId}')) { 
                            window.showModal("Terima Kasih", "Anda sudah mengirimkan RSVP/Ucapan sebelumnya. 1 perangkat hanya dapat mengirim 1 kali.", [{text:"Tutup", color:"bg-gray-600 text-white", action:"tutupModal()"}]); 
                            return; 
                        }
                        
                        const badWords = ['anjing', 'babi', 'monyet', 'bangsat', 'kontol', 'memek', 'jembut', 'goblok', 'tolol', 'ngentot', 'fuck', 'shit', 'bitch'];
                        const urlRegex = /(https?:\\/\\/|www\\.)[a-zA-Z0-9\\-\\.\\+\\/?\\=\\&#]+/gi;
                        const ucapanLower = ucapanVal.toLowerCase();
                        
                        const containsBadWord = badWords.some(word => ucapanLower.includes(word));
                        if(containsBadWord || urlRegex.test(ucapanVal)) { 
                            window.showModal("Peringatan Keamanan", "Maaf, ucapan tidak dapat dikirim karena mengandung tautan/link atau kata-kata yang tidak pantas.", [{text:"Ubah Ucapan", color:"bg-gray-600 text-white", action:"tutupModal()"}]); 
                            return; 
                        }
                        
                        window.showModal("Konfirmasi Pengiriman", "Pastikan ucapan dan kehadiran Anda sudah benar. Pesan yang telah dikirim tidak dapat diubah kembali.", [
                            {text:"Periksa Lagi", color:"bg-gray-600 text-white", action:"tutupModal()"},
                            {text:"Ya, Kirim", color:"bg-[#28a745] text-white", action:"kirimRsvpFinal()"}
                        ]);
                    }
                });`;
            }

            return `
            document.addEventListener('click', function(e) {
                if(e.target.closest('#btn-preview-kirim')) {
                    e.preventDefault();
                    const inputNama = document.getElementById('input-nama'); 
                    const inputUcapan = document.getElementById('input-ucapan'); 
                    const inputKehadiran = document.getElementById('input-kehadiran');
                    
                    const namaVal = inputNama ? inputNama.value.trim() : ''; 
                    const ucapanVal = inputUcapan ? inputUcapan.value.trim() : ''; 
                    const kehadiranVal = inputKehadiran ? inputKehadiran.value : '';
                    
                    if (!namaVal || !ucapanVal || !kehadiranVal) { 
                        window.showModal("Peringatan", "Mohon lengkapi semua kolom form RSVP terlebih dahulu.", [{text:"Mengerti", color:"bg-gray-600 text-white", action:"tutupModal()"}]); 
                        return; 
                    }
                    
                    if(typeof window.kirimRsvpFinal === 'function') window.kirimRsvpFinal();
                }
            });`;
        },

        getLocalStoreScript: function(brideId, isDemoMode, isSpamFilterOn) {
            if (isDemoMode) return `// Demo Mode, tidak menyimpan local storage`;
            if (isSpamFilterOn) return `localStorage.setItem('rsvp_${brideId}', 'true');`;
            return `// Fitur Anti Spam non-aktif`;
        }
    },

    // ==========================================
    // MODUL 2: LOGIKA WAKTU (KALENDER & COUNTDOWN)
    // ==========================================
    Waktu: {
        buildCalendarLink: function(dateIso, timeStart, timeEnd, namaGabungan, lokasi) {
            if(!dateIso || !timeStart) return "#";
            try {
                const [yy, mm, dd] = dateIso.split('-').map(n => parseInt(n,10));
                const [hh, mi] = timeStart.split(':').map(n => parseInt(n,10));
                let hh2 = hh, mi2 = mi;
                if(timeEnd){
                    const tmp = timeEnd.split(':').map(n => parseInt(n,10));
                    hh2 = tmp[0]; mi2 = tmp[1];
                } else {
                    hh2 = (hh + 2) % 24; mi2 = mi;
                }
                const pad2 = (n) => String(n).padStart(2,'0');
                const calStart = `${yy}${pad2(mm)}${pad2(dd)}T${pad2(hh)}${pad2(mi)}00`;
                const calEnd   = `${yy}${pad2(mm)}${pad2(dd)}T${pad2(hh2)}${pad2(mi2)}00`;
                const calDates = `${calStart}/${calEnd}`;
                const calendarText = `The Wedding Of ${namaGabungan}`;
                const calendarDetails = `Kami sangat mengharapkan kehadiran Bapak/Ibu/Saudara/i pada acara pernikahan kami.`;
                const calendarLocation = lokasi ? lokasi.replace(/<br>/g, ', ').replace(/\n/g, ', ') : '';
                return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarText)}&details=${encodeURIComponent(calendarDetails)}&location=${encodeURIComponent(calendarLocation)}&dates=${calDates}`;
            } catch(e) {
                console.error("Gagal merakit link kalender", e); return "#";
            }
        },

        getCountdownScript: function(dateIso, timeStart) {
            if(!dateIso || !timeStart) return "";
            try {
                const [yy, mm, dd] = dateIso.split('-').map(n => parseInt(n,10));
                const [hh, mi] = timeStart.split(':').map(n => parseInt(n,10));
                return `
                (function(){
                  const daysEl  = document.getElementById('cd-days');
                  const hoursEl = document.getElementById('cd-hours');
                  const minsEl  = document.getElementById('cd-mins');
                  const secsEl  = document.getElementById('cd-secs');
                  if(!daysEl || !hoursEl || !minsEl || !secsEl) return;
                  const target = new Date(${yy}, ${mm-1}, ${dd}, ${hh}, ${mi}, 0, 0).getTime();
                  const pad2 = (n) => String(n).padStart(2,'0');
                  function paintZero(){ daysEl.textContent='00'; hoursEl.textContent='00'; minsEl.textContent='00'; secsEl.textContent='00'; }
                  if(!Number.isFinite(target)){ paintZero(); return; }
                  function update(){
                    const now = Date.now(); let dist = target - now;
                    if(dist <= 0){ paintZero(); if(timer) clearInterval(timer); return; }
                    const days = Math.floor(dist / (1000*60*60*24)); dist -= days * (1000*60*60*24);
                    const hours = Math.floor(dist / (1000*60*60)); dist -= hours * (1000*60*60);
                    const mins = Math.floor(dist / (1000*60)); dist -= mins * (1000*60);
                    const secs = Math.floor(dist / 1000);
                    daysEl.textContent = String(days).padStart(2,'0'); hoursEl.textContent = pad2(hours);
                    minsEl.textContent = pad2(mins); secsEl.textContent = pad2(secs);
                  }
                  let timer = null; update(); timer = setInterval(update, 1000);
                })();`;
            } catch(e) { console.error("Gagal membuat script countdown", e); return ""; }
        }
    },

    // ==========================================
    // MODUL 3: LOGIKA INTERAKSI & ANIMASI UI
    // ==========================================
    Interaksi: {
        getScript: function() {
            return `
        document.addEventListener('DOMContentLoaded', () => {
            const btnCover = document.getElementById('tombol-buka-undangan'); 
            const targetSection = document.getElementById('section-tujuan'); 
            const btnIcon = document.getElementById('btn-icon'); 
            const btnText = btnCover ? btnCover.querySelector('.elementor-button-text') : null; 
            const contentUndangan = document.getElementById('content-undangan'); 
            const audio = document.getElementById('audio'); 
            const audioToggle = document.getElementById('audio-toggle'); 
            const fsButton = document.getElementById('enter-fullscreen'); 
            const fsIcon = fsButton ? fsButton.querySelector('i') : null;

            // Logika Kunci Scroll
            const lockScroll = () => { document.body.classList.add('lock-scroll'); document.documentElement.classList.add('lock-scroll'); window.scrollTo(0, 0); };
            const unlockScroll = () => { document.body.classList.remove('lock-scroll'); document.documentElement.classList.remove('lock-scroll'); };
            lockScroll();

            // Logika Fullscreen API
            function isFullscreen() { return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement; }
            function enterFullscreen(el = document.documentElement) { try { if (el.requestFullscreen) el.requestFullscreen(); else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); else if (el.msRequestFullscreen) el.msRequestFullscreen(); } catch (_) {} }
            function exitFullscreen() { if (isFullscreen()) { if (document.exitFullscreen) document.exitFullscreen(); else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); else if (document.msExitFullscreen) document.msExitFullscreen(); } }
            function toggleFullscreen() { if (!isFullscreen()) enterFullscreen(document.documentElement); else exitFullscreen(); }
            function updateFullscreenIcon() { if (isFullscreen()) { if(fsIcon) { fsIcon.classList.remove('fa-expand-arrows-alt'); fsIcon.classList.add('fa-compress-arrows-alt'); } } else { if(fsIcon) { fsIcon.classList.remove('fa-compress-arrows-alt'); fsIcon.classList.add('fa-expand-arrows-alt'); } } }
            if(fsButton) fsButton.addEventListener('click', toggleFullscreen); 
            document.addEventListener('fullscreenchange', updateFullscreenIcon); document.addEventListener('webkitfullscreenchange', updateFullscreenIcon); document.addEventListener('msfullscreenchange', updateFullscreenIcon);

            // Logika Scroll
            const setButtonToScroll = () => { if (btnText) btnText.textContent = 'SCROLL KE BAWAH'; if (btnIcon) { btnIcon.classList.remove('fa-envelope-open', 'far', 'group-hover:scale-110'); btnIcon.classList.add('fas', 'fa-arrow-down', 'animate-bounce'); } };
            const scrollKeTujuan = () => { 
                if (!targetSection) return; 
                if (typeof gsap !== 'undefined' && window.ScrollToPlugin) { 
                    const currentY = window.pageYOffset || document.documentElement.scrollTop || 0; const rect = targetSection.getBoundingClientRect(); const targetY = currentY + rect.top; 
                    gsap.to(window, { duration: 1.5, ease: 'power3.inOut', scrollTo: { y: targetSection, autoKill: false } }); 
                } else { targetSection.scrollIntoView({ behavior: 'smooth' }); } 
            };

            // Logika Buka Undangan Pertama Kali
            const handleFirstClick = (e) => { 
                e.preventDefault(); 
                enterFullscreen(document.documentElement); 
                if (audio && audio.paused) { audio.play().catch(err => console.log("Audio block:", err)); } 
                setButtonToScroll(); 
                unlockScroll(); 
                if(contentUndangan) { contentUndangan.classList.remove('hidden'); contentUndangan.classList.add('flex'); } 
                setTimeout(() => { scrollKeTujuan(); }, 1500); 
                btnCover.removeEventListener('click', handleFirstClick); 
                btnCover.addEventListener('click', (ev) => { ev.preventDefault(); scrollKeTujuan(); }); 
            };
            if (btnCover) btnCover.addEventListener('click', handleFirstClick);
            const onFsChange = () => { if(isFullscreen() && !document.body.classList.contains('lock-scroll')) setButtonToScroll(); }; 
            document.addEventListener('fullscreenchange', onFsChange);

            // Logika Audio Visibility (Pause saat pindah Tab)
            if(audioToggle) { audioToggle.addEventListener('click', function () { if (audio.paused) audio.play(); else audio.pause(); }); }
            if(audio) { audio.addEventListener('play', function () { if(audioToggle) audioToggle.classList.add('rotating'); }); audio.addEventListener('pause', function () { if(audioToggle) audioToggle.classList.remove('rotating'); }); }
            document.addEventListener('visibilitychange', function () { if (!audio) return; if (document.hidden) { if (!audio.paused) { audio.pause(); audio.dataset.wasPlaying = "true"; } else { audio.dataset.wasPlaying = "false"; } } else { if (audio.dataset.wasPlaying === "true") { audio.play(); } } });

            // Logika Intersection Observer (Animasi Muncul)
            const selector = ".muncul, .muncul-kiri, .muncul-kanan, .zoom"; const elementVisible = 110; const qAll = (sel, root=document) => Array.from(root.querySelectorAll(sel));
            if ("IntersectionObserver" in window) { const ioEnter = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("active"); }); }, { root: null, rootMargin: \`0px 0px -\${elementVisible}px 0px\`, threshold: 0 }); const ioExit = new IntersectionObserver((entries) => { entries.forEach(e => { if (!e.isIntersecting) e.target.classList.remove("active"); }); }, { root: null, rootMargin: "0px", threshold: 0 }); qAll(selector).forEach(el => { ioEnter.observe(el); ioExit.observe(el); }); }

            // Logika Toggle Rekening
            const btnToggleRek = document.getElementById('btn-toggle-rekening'); const boxRekening = document.getElementById('box-rekening');
            if (btnToggleRek && boxRekening) { btnToggleRek.addEventListener('click', () => { if (boxRekening.classList.contains('hidden')) { boxRekening.classList.remove('hidden'); boxRekening.classList.add('flex', 'fade-in-box'); document.getElementById('icon-toggle-rekening').className = 'far fa-eye-slash'; document.getElementById('text-toggle-rekening').textContent = 'Sembunyikan Rekening'; } else { boxRekening.classList.add('hidden'); boxRekening.classList.remove('flex', 'fade-in-box'); document.getElementById('icon-toggle-rekening').className = 'fas fa-search'; document.getElementById('text-toggle-rekening').textContent = 'Lihat Rekening'; } }); }
        });
        
        // Logika Copy Text Universal (Tanpa mengganggu warna/style spesifik tema)
        window.copyRekening = function(elementId, btnElement) { 
            const norek = document.getElementById(elementId).innerText; 
            const tempInput = document.createElement('input'); 
            tempInput.value = norek; 
            document.body.appendChild(tempInput); 
            tempInput.select(); 
            document.execCommand('copy'); 
            document.body.removeChild(tempInput); 
            
            const spanText = btnElement.querySelector('span'); 
            const originalText = spanText.textContent; 
            spanText.textContent = 'Tersalin!'; 
            btnElement.style.color = '#16a34a'; // Paksa warna teks jadi hijau menggunakan inline CSS
            
            setTimeout(() => { 
                spanText.textContent = originalText; 
                btnElement.style.color = ''; // Hapus inline CSS untuk kembali ke warna asli tema
            }, 2000); 
        };`;
        }
    },

    // ==========================================
    // MODUL 4: ASET & DATABASE BANK (WEDDING GIFT)
    // ==========================================
    AssetBank: {
        baseUrl: "https://ik.imagekit.io/asetundangan/aset/icon-bank/",
        bgAtm: "Background-atm.webp",
        chipAtm: "chip-atm-undangan.webp",
        
        // List bank yang sudah di-parsing namanya & diurutkan ascending (A-Z)
        list: [
            { nama: "Bank Aladin", file: "Logo-Bank-Aladin.png" },
            { nama: "Bank BCA", file: "Logo-Bank-BCA-1.png" },
            { nama: "Bank BJB", file: "Logo-Bank-BJB.png" },
            { nama: "Bank BNI", file: "BNI_logo.svg" },
            { nama: "Bank BRI", file: "logo-BRI.svg" },
            { nama: "Bank BSI", file: "Logo-Bank-BSI.png" },
            { nama: "Bank BTN", file: "logo-bank-BTN.png" },
            { nama: "Bank CIMB Niaga", file: "Logo-Bank-CIMB-Niaga.png" },
            { nama: "Bank DKI", file: "Logo-Bank-DKI.png" },
            { nama: "Bank Jago", file: "Logo-bank-jago.png" },
            { nama: "Bank Jambi", file: "Logo-Bank-Jambi.png" },
            { nama: "Bank Jateng", file: "Logo-Bank-Jateng.png" },
            { nama: "Bank Jatim", file: "Logo-Bank-Jatim.png" },
            { nama: "Bank Jenius", file: "Logo-Bank-Jenius.png" },
            { nama: "Bank Mandiri", file: "logo-bank-mandiri.png" },
            { nama: "Bank Muamalat", file: "Logo-Bank-Muamalat.png" },
            { nama: "Bank Nagari", file: "Logo-Bank-Nagari.png" },
            { nama: "Bank OCBC", file: "Logo-Bank-OCBC.png" },
            { nama: "Bank Permata", file: "Logo-Bank-Permata.png" },
            { nama: "Bank Seabank", file: "Logo-Bank-Seabank.png" },
            { nama: "Bank Sinarmas", file: "Logo-Bank-Sinarmas.png" },
            { nama: "Bank Sulselbar", file: "Logo-Bank-Sulselbar.png" },
            { nama: "Bank Sumut", file: "Logo-Bank-Sumut.png" },
            { nama: "Bank UOB", file: "Logo-Bank-UOB.png" },
            { nama: "Bank Woori Saudara", file: "bank-Woori-Saudara-BWS-Wori.png" },
            { nama: "DANA", file: "Logo-Dana.png" },
            { nama: "GoPay", file: "Logo-Gopay.png" },
            { nama: "OVO", file: "Logo-Ovo.png" }
        ],

        /**
         * Mengembalikan elemen <option> HTML untuk select dropdown bank.
         * @param {string} selectedFilename - Nama file yang sedang dipilih (opsional)
         */
        getOptionsHTML: function(selectedFilename) {
            let options = '';
            this.list.forEach(bank => {
                const isSelected = (bank.file === selectedFilename) ? 'selected' : '';
                options += `<option value="${bank.file}" ${isSelected}>${bank.nama}</option>`;
            });
            return options;
        },

        /**
         * Mengembalikan URL lengkap untuk logo bank
         */
        getLogoUrl: function(filename) {
            return this.baseUrl + filename;
        }
    },

    // ==========================================
    // MODUL 5: ASET MUSIK (BGM)
    // ==========================================
    AssetMusik: {
        // Daftar lagu default terintegrasi
        list: [
            { judul: "Andmesh - Anugerah Terindah (Full - Sempat Ku)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Andmesh%20-%20Anugerah%20Terindah%20(Full%20-%20Sempat%20Ku).mp3" },
            { judul: "Ari Lasso - Cinta Terakhir (Reff - Kini)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Ari%20Lasso%20-%20Cinta%20Terakhir%20(Reff%20-%20Kini).mp3" },
            { judul: "Arvian Dwi - Satu Shaf Dibelakangku (Reff - Ku Mencintaimu)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Arvian%20Dwi%20-%20Satu%20Shaf%20Dibelakangku%20(Reff%20-%20Ku%20Mencintaimu).mp3" },
            { judul: "Brisia Jodie - Aku Memilihmu (Full - Hari Ini)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Brisia%20Jodie%20-%20Aku%20Memilihmu%20(Full%20-%20Hari%20Ini).mp3" },
            { judul: "Brisia Jodie - Aku Memilihmu (Reff Wanita)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Brisia%20Jodie%20-%20Aku%20Memilihmu%20(Reff%20Wanita).mp3" },
            { judul: "English - Brian McKnight - Marry Your Daughter (Full)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/English%20-%20Brian%20McKnight%20-%20Marry%20Your%20Daughter%20(Full).mp3" },
            { judul: "English - Christian Bautista - The Way You Look At Me (Reff - Cause There)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/English%20-%20Christian%20Bautista%20-%20The%20Way%20You%20Look%20At%20Me%20(Reff%20-%20Cause%20There).mp3" },
            { judul: "English - Christina Perri - A Thousand Years (Full)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/English%20-%20Christina%20Perri%20-%20A%20Thousand%20Years%20(Full).mp3" },
            { judul: "English - Shane Filan - Beautiful In White (Full)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/English%20-%20Shane%20Filan%20-%20Beautiful%20In%20White%20(Full).mp3" },
            { judul: "English - Shane Filan - Beautiful In White (Reff - So As)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/English%20-%20Shane%20Filan%20-%20Beautiful%20In%20White%20(Reff%20-%20So%20As).mp3" },
            { judul: "English - Stephen Sanchez - Until I Found You", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/English%20-%20Stephen%20Sanchez%20-%20Until%20I%20Found%20You.mp3" },
            { judul: "Islami - Maher Zain - Baraka-Allahu Lakuma (Full)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Islami%20-%20Maher%20Zain%20-%20Baraka-Allahu%20Lakuma%20(Full).mp3" },
            { judul: "Islami - Maher Zain - For The Rest Of My Life (Reff - For The)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Islami%20-%20Maher%20Zain%20-%20For%20The%20Rest%20Of%20My%20Life%20(Reff%20-%20For%20The).mp3" },
            { judul: "Islami - Maher Zain - Nas Teshbehlena (Full)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Islami%20-%20Maher%20Zain%20-%20Nas%20Teshbehlena%20(Full).mp3" },
            { judul: "Islami - Maher Zain - Rahmatun Lilâ€™Alameen (Full)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Islami%20-%20Maher%20Zain%20-%20Rahmatun%20Lil%E2%80%99Alameen%20(Full).mp3" },
            { judul: "Islami - Maher Zain - Ya Nabi Salam Alayka (Reff - Ya Habibi)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Islami%20-%20Maher%20Zain%20-%20Ya%20Nabi%20Salam%20Alayka%20(Reff%20-%20Ya%20Habibi).mp3" },
            { judul: "Islami - Maher Zain - Salla Alayka Rahman (Full)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Islami%20-%20Maher%20Zain%20-Salla%20Alayka%20Rahman%20(Full).mp3" },
            { judul: "Islami - Maher Zain - Sepanjang Hidup (Reff - Sepanjang)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Islami%20-%20Maher%20Zain%20-Sepanjang%20Hidup%20(Reff%20-%20Sepanjang).mp3" },
            { judul: "Islami - Muhammad Al Muqit - Wedding Nasheed (Full - Ala Jabili)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Islami%20-%20Muhammad%20Al%20Muqit%20-%20Wedding%20Nasheed%20(Full%20-%20Ala%20Jabili).mp3" },
            { judul: "Islami - Muhammad Youssef - Al Hijratu (Full)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Islami%20-%20Muhammad%20Youssef%20-%20Al%20Hijratu%20(Full).mp3" },
            { judul: "Melly Goeslaw - Ketika Cinta Bertasbih (Full)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Melly%20Goeslaw%20-%20Ketika%20Cinta%20Bertasbih%20(Full).mp3" },
            { judul: "Nadhif Basalamah - Kota Ini Tak Sama Tanpamu", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Nadhif%20Basalamah%20-%20Kota%20Ini%20Tak%20Sama%20Tanpamu.mp3" },
            { judul: "Nadhif Basalamah - Penjaga Hati (Full)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Nadhif%20Basalamah%20-%20Penjaga%20Hati%20(Full).mp3" },
            { judul: "Naff - Akhirnya Ku Menemukanmu (Full)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Naff%20-%20Akhirnya%20Ku%20Menemukanmu%20(Full).mp3" },
            { judul: "Rizky Febian - Bermuara (Reff - Sayang)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Rizky%20Febian%20-%20Bermuara%20(Reff%20-%20Sayang).mp3" },
            { judul: "Tiara Andini - Lagu Pernikahan Kita (Full)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Tiara%20Andini%20-%20Lagu%20Pernikahan%20Kita%20(Full).mp3" },
            { judul: "Tiara Andini - Lagu Pernikahan Kita (Reff Pria - Demi Tuhan Aku)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Tiara%20Andini%20-%20Lagu%20Pernikahan%20Kita%20(Reff%20Pria%20-%20Demi%20Tuhan%20Aku).mp3" },
            { judul: "Yovie & Nuno - Janji Suci (Full)", url: "https://github.com/asetundangan/lagu/raw/refs/heads/main/Yovie%20&%20Nuno%20-%20Janji%20Suci%20(Full).mp3" }
        ],
        
        getOptionsHTML: function() {
            let options = '';
            this.list.forEach(lagu => {
                options += `<option value="${lagu.url}">${lagu.judul}</option>`;
            });
            return options;
        }
    }
};
