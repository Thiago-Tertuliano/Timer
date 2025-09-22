class Timer {
    constructor() {
        this.totalTime = 0;
        this.remainingTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.intervalId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
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
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Atualizar tempo quando os inputs mudarem
        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('input', () => this.updateTimeFromInputs());
        });
        
        // Prevenir valores inválidos nos inputs
        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('blur', () => this.validateInput(input));
        });
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
        
        // Efeito visual de conclusão
        this.showNotification('Timer finalizado! ⏰', 'success');
        this.playNotificationSound();
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
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    playNotificationSound() {
        // Criar um som de notificação simples usando Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
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
});
