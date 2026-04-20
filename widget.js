// =============================================================================
// 💬 CHATBASE CLONE — EMBEDDABLE CHAT WIDGET
// =============================================================================
// Usage: Add this to any website:
//
//   <script>
//     window.chatbaseConfig = {
//       chatbotId: "your-bot-id",
//       apiUrl: "https://your-space.hf.space",
//       themeColor: "#6C63FF",        // optional
//       position: "right",            // optional: "left" or "right"
//       initialMessage: "Hi! How can I help?", // optional
//     };
//   </script>
//   <script src="widget.js" defer></script>
//
// =============================================================================

(function () {
    'use strict';

    const config = window.chatbaseConfig || {};
    const chatbotId = config.chatbotId || '';
    const apiUrl = (config.apiUrl || '').replace(/\/+$/, '');
    const themeColor = config.themeColor || '#6C63FF';
    const position = config.position || 'right';
    const initialMessage = config.initialMessage || "Hi! I'm an AI assistant. How can I help you?";

    if (!chatbotId || !apiUrl) {
        console.error('[Chatbase Widget] Missing chatbotId or apiUrl in window.chatbaseConfig');
        return;
    }

    // =========================================================================
    // Styles
    // =========================================================================
    const styles = `
        #cb-widget-bubble {
            position: fixed;
            bottom: 24px;
            ${position}: 24px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: ${themeColor};
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            box-shadow: 0 4px 24px ${themeColor}55;
            z-index: 99999;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        #cb-widget-bubble:hover {
            transform: scale(1.08);
            box-shadow: 0 6px 32px ${themeColor}77;
        }
        #cb-widget-bubble.open {
            transform: rotate(90deg) scale(0.9);
        }

        #cb-widget-window {
            position: fixed;
            bottom: 96px;
            ${position}: 24px;
            width: 380px;
            height: 540px;
            background: #12121A;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            box-shadow: 0 12px 48px rgba(0,0,0,0.5);
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 99999;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            animation: cbSlideUp 0.3s ease-out;
        }
        #cb-widget-window.open {
            display: flex;
        }

        @keyframes cbSlideUp {
            from { opacity: 0; transform: translateY(16px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .cb-header {
            padding: 16px 20px;
            background: ${themeColor};
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .cb-header-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .cb-header-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
        }
        .cb-header-name {
            font-weight: 600;
            font-size: 15px;
        }
        .cb-header-status {
            font-size: 12px;
            opacity: 0.85;
        }
        .cb-close {
            background: none;
            border: none;
            color: white;
            font-size: 22px;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        .cb-close:hover { opacity: 1; }

        .cb-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: #0A0A0F;
        }
        .cb-messages::-webkit-scrollbar { width: 4px; }
        .cb-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        .cb-msg {
            max-width: 85%;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.6;
            word-wrap: break-word;
            animation: cbFadeIn 0.3s ease-out;
        }
        @keyframes cbFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .cb-msg.bot {
            background: #1A1A2E;
            color: #E0E0F0;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }
        .cb-msg.user {
            background: ${themeColor};
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }

        .cb-typing {
            display: flex;
            gap: 4px;
            padding: 12px 16px;
            align-self: flex-start;
        }
        .cb-typing-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #6B6B80;
            animation: cbBounce 1.4s infinite;
        }
        .cb-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .cb-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes cbBounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-6px); }
        }

        .cb-input-area {
            padding: 12px 16px;
            border-top: 1px solid rgba(255,255,255,0.06);
            background: #12121A;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .cb-input {
            flex: 1;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 24px;
            padding: 10px 16px;
            color: white;
            font-size: 14px;
            font-family: inherit;
            outline: none;
            transition: border-color 0.2s;
        }
        .cb-input:focus {
            border-color: ${themeColor}88;
        }
        .cb-input::placeholder { color: #6B6B80; }

        .cb-send {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: ${themeColor};
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: background 0.2s;
        }
        .cb-send:hover { filter: brightness(1.1); }
        .cb-send:disabled { opacity: 0.5; cursor: not-allowed; }

        .cb-powered {
            text-align: center;
            padding: 6px;
            font-size: 11px;
            color: #6B6B80;
            background: #12121A;
        }
        .cb-powered a {
            color: ${themeColor};
            text-decoration: none;
        }

        @media (max-width: 480px) {
            #cb-widget-window {
                width: calc(100% - 32px);
                ${position}: 16px;
                bottom: 88px;
                height: 60vh;
            }
        }
    `;

    // =========================================================================
    // Create DOM
    // =========================================================================
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // Bubble
    const bubble = document.createElement('button');
    bubble.id = 'cb-widget-bubble';
    bubble.innerHTML = '💬';
    bubble.setAttribute('aria-label', 'Open chat');
    document.body.appendChild(bubble);

    // Window
    const win = document.createElement('div');
    win.id = 'cb-widget-window';
    win.innerHTML = `
        <div class="cb-header">
            <div class="cb-header-left">
                <div class="cb-header-avatar">🤖</div>
                <div>
                    <div class="cb-header-name">AI Assistant</div>
                    <div class="cb-header-status">● Online</div>
                </div>
            </div>
            <button class="cb-close" id="cb-close">✕</button>
        </div>
        <div class="cb-messages" id="cb-messages"></div>
        <div class="cb-input-area">
            <input class="cb-input" id="cb-input" placeholder="Type a message..." autocomplete="off">
            <button class="cb-send" id="cb-send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            </button>
        </div>
        <div class="cb-powered">Powered by <a href="#">Chatbase</a></div>
    `;
    document.body.appendChild(win);

    // =========================================================================
    // State & Logic
    // =========================================================================
    let isOpen = false;
    let history = [];
    let isLoading = false;

    function toggle() {
        isOpen = !isOpen;
        bubble.classList.toggle('open', isOpen);
        win.classList.toggle('open', isOpen);
        if (isOpen) {
            document.getElementById('cb-input').focus();
        }
    }

    function addMsg(role, text) {
        const msgs = document.getElementById('cb-messages');
        const div = document.createElement('div');
        div.className = `cb-msg ${role}`;
        div.innerHTML = formatText(text);
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function showTyping() {
        const msgs = document.getElementById('cb-messages');
        const div = document.createElement('div');
        div.id = 'cb-typing';
        div.className = 'cb-typing';
        div.innerHTML = '<div class="cb-typing-dot"></div><div class="cb-typing-dot"></div><div class="cb-typing-dot"></div>';
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function hideTyping() {
        const el = document.getElementById('cb-typing');
        if (el) el.remove();
    }

    function formatText(text) {
        let s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
        s = s.replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.08);padding:1px 4px;border-radius:3px;font-size:0.9em">$1</code>');
        s = s.replace(/\n/g, '<br>');
        return s;
    }

    async function send() {
        if (isLoading) return;
        const input = document.getElementById('cb-input');
        const msg = input.value.trim();
        if (!msg) return;

        addMsg('user', msg);
        history.push({ role: 'user', content: msg });
        input.value = '';
        isLoading = true;
        document.getElementById('cb-send').disabled = true;

        showTyping();

        try {
            const resp = await fetch(`${apiUrl}/api/chat/${encodeURIComponent(chatbotId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msg,
                    history: history.slice(-10),
                    stream: false,
                }),
                signal: AbortSignal.timeout(60000),
            });

            hideTyping();

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.detail || 'Request failed');
            }

            const data = await resp.json();
            const reply = data.response || 'Sorry, I could not generate a response.';
            addMsg('bot', reply);
            history.push({ role: 'assistant', content: reply });

        } catch (err) {
            hideTyping();
            addMsg('bot', `⚠️ Error: ${err.message}`);
        }

        isLoading = false;
        document.getElementById('cb-send').disabled = false;
        input.focus();
    }

    // =========================================================================
    // Events
    // =========================================================================
    bubble.addEventListener('click', toggle);
    document.getElementById('cb-close').addEventListener('click', toggle);
    document.getElementById('cb-send').addEventListener('click', send);
    document.getElementById('cb-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    });

    // Show initial message
    addMsg('bot', initialMessage);

    // Load bot name
    fetch(`${apiUrl}/api/chatbot/${encodeURIComponent(chatbotId)}`, { signal: AbortSignal.timeout(15000) })
        .then(r => r.json())
        .then(bot => {
            const nameEl = win.querySelector('.cb-header-name');
            if (nameEl && bot.name) nameEl.textContent = bot.name;
        })
        .catch(() => {});

})();
