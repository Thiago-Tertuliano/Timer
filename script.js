class Timer {
    constructor() {
        this.totalTime = 0;
        this.remainingTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.intervalId = null;
        this.soundEnabled = true;
        this.isDarkMode = false;
        this.history = JSON.parse(localStorage.getItem('timerHistory') || '[]');
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.loadSettings();
        this.updateHistoryDisplay();
    }
    
    initializeElements() {
        this.hoursInput = document.getElementById('hours');
        this.minutesInput = document.getElementById('minutes');
        this.secondsInput = document.getElementById('seconds');
        this.displayTime = document.getElementById('display-time');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.statusText = document.getElementById('status-text');
        this.timerCard = document.querySelector('.timer-card');
        this.presetBtns = document.querySelectorAll('.preset-btn');
        this.themeToggle = document.getElementById('theme-toggle');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.soundToggle = document.getElementById('sound-toggle');
        this.timerCircle = document.getElementById('timer-circle');
        this.historySection = document.getElementById('history-section');
        this.historyList = document.getElementById('history-list');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Presets rápidos
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setPreset(btn));
        });
        
        // Atualizar tempo quando os inputs mudarem
        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('input', () => this.updateTimeFromInputs());
        });
        
        // Prevenir valores inválidos nos inputs
        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('blur', () => this.validateInput(input));
        });
        
        // Melhorar UX com Enter nos inputs
        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.start();
                }
            });
        });
        
        // Controles do header
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.soundToggle.addEventListener('click', () => this.toggleSound());
    }
    
    setPreset(btn) {
        if (this.isRunning || this.isPaused) {
            this.showNotification('Pause o timer antes de alterar o tempo', 'info');
            return;
        }
        
        const minutes = parseInt(btn.dataset.minutes);
        this.hoursInput.value = 0;
        this.minutesInput.value = minutes;
        this.secondsInput.value = 0;
        
        this.updateTimeFromInputs();
        this.showNotification(`Preset definido: ${minutes} minutos`, 'success');
        
        // Efeito visual no botão
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);
    }
    
    validateInput(input) {
        const value = parseInt(input.value) || 0;
        const max = input.id === 'hours' ? 23 : 59;
        
        if (value < 0) input.value = 0;
        if (value > max) input.value = max;
        
        this.updateTimeFromInputs();
    }
    
    updateTimeFromInputs() {
        if (!this.isRunning && !this.isPaused) {
            const hours = parseInt(this.hoursInput.value) || 0;
            const minutes = parseInt(this.minutesInput.value) || 0;
            const seconds = parseInt(this.secondsInput.value) || 0;
            
            this.totalTime = (hours * 3600) + (minutes * 60) + seconds;
            this.remainingTime = this.totalTime;
            this.updateDisplay();
        }
    }
    
    start() {
        if (this.isPaused) {
            // Retomar timer pausado
            this.isPaused = false;
            this.isRunning = true;
            this.startInterval();
        } else {
            // Iniciar novo timer
            this.updateTimeFromInputs();
            
            if (this.totalTime <= 0) {
                this.showNotification('Por favor, defina um tempo válido!', 'error');
                return;
            }
            
            this.remainingTime = this.totalTime;
            this.isRunning = true;
            this.isPaused = false;
            this.startInterval();
        }
        
        this.updateButtons();
        this.updateStatus('Timer em execução...');
        this.timerCard.classList.add('timer-running');
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            this.stopInterval();
            this.updateButtons();
            this.updateStatus('Timer pausado');
            this.timerCard.classList.remove('timer-running');
        }
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.stopInterval();
        
        this.remainingTime = this.totalTime;
        this.updateDisplay();
        this.updateButtons();
        this.updateStatus('Pronto para iniciar');
        this.timerCard.classList.remove('timer-running');
        
        // Limpar inputs
        this.hoursInput.value = 0;
        this.minutesInput.value = 0;
        this.secondsInput.value = 0;
        this.totalTime = 0;
    }
    
    startInterval() {
        this.intervalId = setInterval(() => {
            if (this.remainingTime <= 0) {
                this.complete();
                return;
            }
            
            this.remainingTime--;
            this.updateDisplay();
        }, 1000);
    }
    
    stopInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    complete() {
        this.isRunning = false;
        this.isPaused = false;
        this.stopInterval();
        
        this.remainingTime = 0;
        this.updateDisplay();
        this.updateButtons();
        this.updateStatus('Timer finalizado!');
        this.timerCard.classList.remove('timer-running');
        
        // Salvar no histórico
        this.saveToHistory();
        
        // Efeito visual de conclusão
        this.showNotification('Timer finalizado! ⏰', 'success');
        if (this.soundEnabled) {
            this.playNotificationSound();
        }
    }
    
    updateDisplay() {
        const hours = Math.floor(this.remainingTime / 3600);
        const minutes = Math.floor((this.remainingTime % 3600) / 60);
        const seconds = this.remainingTime % 60;
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.displayTime.textContent = timeString;
        
        // Atualizar barra de progresso
        if (this.totalTime > 0) {
            const progress = ((this.totalTime - this.remainingTime) / this.totalTime) * 100;
            this.progressFill.style.width = `${progress}%`;
            this.progressText.textContent = `${Math.round(progress)}%`;
        } else {
            this.progressFill.style.width = '0%';
            this.progressText.textContent = '0%';
        }
    }
    
    updateButtons() {
        if (this.isRunning) {
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.resetBtn.disabled = false;
        } else if (this.isPaused) {
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.resetBtn.disabled = false;
        } else {
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.resetBtn.disabled = this.totalTime === 0;
        }
    }
    
    updateStatus(message) {
        this.statusText.textContent = message;
    }
    
    showNotification(message, type = 'info') {
        // Remover notificações existentes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos da notificação
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: pointer;
        `;
        
        // Cores baseadas no tipo
        const colors = {
            success: 'linear-gradient(135deg, #4CAF50, #45a049)',
            error: 'linear-gradient(135deg, #f44336, #d32f2f)',
            info: 'linear-gradient(135deg, #2196F3, #1976D2)'
        };
        
        notification.style.background = colors[type] || colors.info;
        
        // Adicionar CSS da animação
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Permitir fechar clicando
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
        document.body.appendChild(notification);
        
        // Remover após 4 segundos (aumentado para dar tempo de ler)
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 4000);
    }
    
    playNotificationSound() {
        // Criar um som de notificação mais agradável usando Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Som de conclusão mais musical
            const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
            const duration = 0.2;
            
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + (index * 0.1));
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime + (index * 0.1));
                gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + (index * 0.1) + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + (index * 0.1) + duration);
                
                oscillator.start(audioContext.currentTime + (index * 0.1));
                oscillator.stop(audioContext.currentTime + (index * 0.1) + duration);
            });
        } catch (error) {
            // Fallback silencioso se Web Audio API não estiver disponível
            console.log('Som de notificação não disponível');
        }
    }
}

// Inicializar o timer quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new Timer();
});

// Adicionar suporte para teclas de atalho
document.addEventListener('keydown', (event) => {
    // Evitar atalhos quando estiver digitando nos inputs
    if (event.target.tagName === 'INPUT') {
        return;
    }
    
    // Espaço para iniciar/pausar
    if (event.code === 'Space') {
        event.preventDefault();
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        
        if (!startBtn.disabled) {
            startBtn.click();
        } else if (!pauseBtn.disabled) {
            pauseBtn.click();
        }
    }
    
    // R para reset
    if (event.code === 'KeyR') {
        event.preventDefault();
        const resetBtn = document.getElementById('reset-btn');
        if (!resetBtn.disabled) {
            resetBtn.click();
        }
    }
    
    // Números 1-4 para presets rápidos
    if (event.code >= 'Digit1' && event.code <= 'Digit4') {
        event.preventDefault();
        const presetIndex = parseInt(event.code.replace('Digit', '')) - 1;
        const presetBtns = document.querySelectorAll('.preset-btn');
        if (presetBtns[presetIndex]) {
            presetBtns[presetIndex].click();
        }
    }
});
