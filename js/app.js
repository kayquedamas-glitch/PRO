/* app-pro.js - VERSÃO DEFINITIVA (INTELIGÊNCIA DE ELITE) */

document.addEventListener('DOMContentLoaded', () => {
    
    const API_URL = "https://long-block-7f38.kayquedamas.workers.dev"; 
    const API_MODEL = "llama-3.1-8b-instant"; 
    
    // --- ELEMENTOS DOM ---
    const messagesContainer = document.getElementById('messagesContainer');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const viewChat = document.getElementById('viewChat');
    const viewProtocolo = document.getElementById('viewProtocolo');
    const tabChat = document.getElementById('tabChat');
    const tabProtocolo = document.getElementById('tabJornada');
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    // --- DEFINIÇÃO DAS FERRAMENTAS (A ALMA DO APP) ---
    const toolDefinitions = {
        
        'Diagnostico': { 
            title: "Terapeuta de Bolso", 
            subtitle: "Como você está se sentindo?", 
            typewriterExamples: ["estou ansioso...", "procrastinei hoje...", "sinto culpa."],
            
            // O PSICÓLOGO AMIGO
            systemPrompt: `Você é o Synapse, um psicólogo comportamental experiente e acolhedor.
OBJETIVO: Entender o estado emocional atual do usuário rapidamente.
ESTILO: Curto, empático e direto. Fale como um colega sábio no WhatsApp.
REGRA DE OURO: Faça APENAS UMA pergunta por vez.
BOTÕES: Sempre termine sua resposta sugerindo 3 emoções ou ações prováveis no formato: <<Opção 1>> <<Opção 2>> <<Opção 3>>.

Exemplo de fluxo:
Usuário: "Tô mal."
Você: "Sinto muito, cara. É cansaço mental ou aconteceu algo específico? <<Cansaço>> <<Aconteceu algo>> <<Só desânimo>>"` 
        },

        'Estrategista': { 
            title: "Estrategista Militar", 
            subtitle: "O que precisamos vencer hoje?", 
            typewriterExamples: ["tenho um projeto...", "preciso estudar...", "limpar a casa."],
            
            // O GENERAL PRÁTICO
            systemPrompt: `Você é o Estrategista. Seu lema é "Dividir para Conquistar".
OBJETIVO: Pegar uma tarefa grande/assustadora do usuário e quebrá-la em 3 micro-passos ridículos de fáceis.
ESTILO: Militar, motivador, focado em ação imediata.
BOTÕES: Termine perguntando qual o primeiro passo. Ex: <<Começar Passo 1>> <<Revisar>> <<Outra Meta>>`
        },

        'Mestre': { 
            title: "Arquiteto de Hábitos", 
            subtitle: "Qual hábito vamos instalar?", 
            typewriterExamples: ["ler mais...", "treinar todo dia...", "acordar cedo."],
            
            // O CIENTISTA DE DADOS
            systemPrompt: `Você é o Ferreiro de Hábitos (baseado em James Clear/Andrew Huberman).
OBJETIVO: Criar um loop neurológico para um novo hábito.
MÉTODO: Defina com o usuário: 1. O Gatilho (Quando?) 2. A Ação (O quê?) 3. A Recompensa (O que ganho?).
ESTILO: Técnico, preciso e lógico.
BOTÕES: Guie a escolha. Ex: <<Definir Gatilho>> <<Definir Recompensa>> <<Já tenho um>>`
        },

        'Auditor': { 
            title: "Investigador de Recaídas", 
            subtitle: "Onde foi que erramos?", 
            typewriterExamples: ["recaí no vício...", "fiquei no celular...", "comi besteira."],
            
            // O DETETIVE SEM JULGAMENTO
            systemPrompt: `Você é o Auditor. O usuário falhou e está se sentindo culpado.
OBJETIVO: Tirar a culpa e achar a CAUSA RAIZ técnica.
MÉTODO: Use a técnica HALT (Hungry, Angry, Lonely, Tired). Ele estava com Fome, Raiva, Solitário ou Cansado?
ESTILO: Frio, analítico, mas focado em solução, não em culpa.
BOTÕES: Sugira as causas prováveis. Ex: <<Estava Cansado>> <<Estava Entediado>> <<Estava Ansioso>>`
        }
    };

    let currentTool = 'Diagnostico';
    // Inicia com o prompt da ferramenta padrão
    let conversationHistory = [{ role: "system", content: toolDefinitions['Diagnostico'].systemPrompt }];

    // --- NAVEGAÇÃO DE ABAS (Chat vs Jornada) ---
    window.switchTab = function(tab) {
        // Reset visual dos botões inferiores
        tabChat.classList.remove('active');
        tabChat.style.color = '#666';
        if(tabProtocolo) { tabProtocolo.classList.remove('active'); tabProtocolo.style.color = '#666'; }
        
        // Esconde as telas
        viewChat.classList.add('hidden');
        viewProtocolo.classList.add('hidden');

        if (tab === 'chat') {
            viewChat.classList.remove('hidden');
            tabChat.classList.add('active');
            tabChat.style.color = '#EAB308'; // Dourado PRO
        } else {
            viewProtocolo.classList.remove('hidden');
            if(tabProtocolo) { tabProtocolo.classList.add('active'); tabProtocolo.style.color = '#EAB308'; }
        }
    }

    // --- TROCA DE FERRAMENTAS (SIDEBAR) ---
    function setActiveTool(toolName) {
        currentTool = toolName;
        const tool = toolDefinitions[toolName];
        
        // Feedback visual no chat (limpa mensagens antigas e mostra subtítulo novo)
        messagesContainer.innerHTML = `
            <div class="w-full text-center mb-6 p-4">
                <p class="text-gray-500 text-xs uppercase tracking-widest mb-1">Modo Ativo</p>
                <p class="text-yellow-500 font-bold text-sm">${tool.title}</p>
                <p class="text-gray-600 text-xs mt-1">${tool.subtitle}</p>
            </div>
        `;
        
        // Reseta a memória da IA com a nova persona
        conversationHistory = [{ role: "system", content: tool.systemPrompt }];
        
        // Se for mobile, fecha o menu após clicar
        if(window.innerWidth <= 768) closeSidebar();
        
        // Atualiza classe 'active' na sidebar
        document.querySelectorAll('.tool-item').forEach(item => {
            item.classList.remove('active');
            // Remove cores antigas para garantir
            item.style.borderLeft = 'none'; 
            item.style.color = '#a3a3a3';
            
            if(item.id === `tool${toolName}`) {
                item.classList.add('active');
                item.style.color = '#EAB308'; // Dourado
                item.style.borderLeft = '3px solid #EAB308';
            }
        });

        // Inicia animação de texto específica da ferramenta
        if(tool.typewriterExamples) startTypewriter(tool.typewriterExamples);
    }

    // --- SISTEMA DE CHAT E BOTÕES ---
    function addMessage(message, isUser) {
        // Regex para capturar botões <<Texto>>
        const buttonRegex = /<<(.+?)>>/g;
        const buttons = [];
        let match;
        while ((match = buttonRegex.exec(message)) !== null) buttons.push(match[1]);

        // Limpa o texto para exibição (tira os códigos dos botões e tags)
        let cleanMessage = message.replace(/<<.+?>>/g, '').trim();
        cleanMessage = cleanMessage.replace('[FIM_DA_SESSAO]', '').trim();
        
        // Formatação simples (Negrito e Quebra de linha)
        cleanMessage = cleanMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

        // Adiciona o balão de texto (se houver texto)
        if (cleanMessage) {
            const div = document.createElement('div');
            div.className = isUser ? 'chat-message-user' : 'chat-message-ia';
            div.innerHTML = cleanMessage;
            messagesContainer.appendChild(div);
        }

        // Adiciona os botões (SEPARADOS, estilo teclado)
        // Só mostra se não for mensagem do usuário e tiver botões
        if (buttons.length > 0 && !isUser) {
            const btnContainer = document.createElement('div');
            btnContainer.className = 'quick-reply-container'; // CSS Grid 2 colunas
            
            buttons.forEach(btnText => {
                const btn = document.createElement('button');
                btn.className = 'cyber-btn';
                btn.innerText = btnText;
                // Ao clicar, envia o texto como se o usuário tivesse digitado
                btn.onclick = () => sendQuickReply(btnText);
                btnContainer.appendChild(btn);
            });
            messagesContainer.appendChild(btnContainer);
        }
        
        // Rola para o fim
        const scroller = document.querySelector('.chat-messages');
        if(scroller) setTimeout(() => { scroller.scrollTop = scroller.scrollHeight; }, 50);
    }

    function sendQuickReply(text) {
        // Esconde os botões anteriores para limpar a tela
        const lastBtns = messagesContainer.querySelector('.quick-reply-container:last-child');
        if(lastBtns) lastBtns.style.display = 'none';
        
        chatInput.value = text;
        sendMessage();
    }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if(!text) return;
        
        addMessage(text, true); // Adiciona msg do usuário
        chatInput.value = '';
        chatInput.disabled = true;
        
        conversationHistory.push({ role: "user", content: text });

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: API_MODEL, messages: conversationHistory })
            });
            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content || "Erro de conexão. Tente novamente.";
            
            addMessage(reply, false); // Adiciona msg da IA
            conversationHistory.push({ role: "assistant", content: reply });
        } catch(e) {
            addMessage("Erro de conexão.", false);
        } finally {
            chatInput.disabled = false;
            chatInput.focus(); // Traz o teclado de volta (no desktop)
        }
    }

    // --- SISTEMA DE SOS (PÂNICO) ---
    const btnSOS = document.getElementById('btnSOS');
    if(btnSOS) {
        btnSOS.addEventListener('click', () => {
            window.switchTab('chat');
            addMessage("🚨 ATIVANDO PROTOCOLO DE EMERGÊNCIA", true);
            
            // Prompt de alta prioridade para quebra de padrão
            const sosContext = [
                { role: "system", content: "URGENTE: O usuário está em crise de ansiedade ou fissura. Dê uma ordem curta, física e imediata (ex: 'Solte o celular', 'Água gelada no rosto', 'Respiração 4-7-8'). Não faça perguntas." }
            ];
            
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: API_MODEL, messages: sosContext })
            })
            .then(res => res.json())
            .then(data => addMessage(data.choices[0].message.content, false));
        });
    }

    // --- CONTROLES DE UI (Sidebar) ---
    function openSidebar() { sidebar.classList.add('open'); overlay.classList.add('open'); }
    function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('open'); }

    if(sendBtn) sendBtn.addEventListener('click', sendMessage);
    if(chatInput) chatInput.addEventListener('keydown', e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
    if(menuBtn) menuBtn.addEventListener('click', openSidebar);
    if(overlay) overlay.addEventListener('click', closeSidebar);
    
    // Click nos itens do menu
    document.querySelectorAll('.tool-item').forEach(item => {
        item.addEventListener('click', () => {
            const toolName = item.id.replace('tool', '');
            if(toolDefinitions[toolName]) setActiveTool(toolName);
        });
    });

    // --- GAMIFICAÇÃO (Checkboxes e Streak) ---
    // Salva o progresso real no LocalStorage do navegador
    document.querySelectorAll('.routine-item input').forEach(chk => {
        if(localStorage.getItem(`pro_${chk.id}`) === 'true') chk.checked = true;
        
        chk.addEventListener('change', () => {
            localStorage.setItem(`pro_${chk.id}`, chk.checked);
            // Se marcar, dá um feedback visual no contador de streak
            if(chk.checked) {
                const s = document.getElementById('streakCount');
                if(s) {
                    s.style.color = '#4ade80'; // Verde
                    s.style.transform = 'scale(1.2)';
                    setTimeout(() => s.style.transform = 'scale(1)', 200);
                }
            }
        });
    });

    // --- ANIMAÇÃO DE TEXTO (Typewriter) ---
    let typeTimeout;
    function startTypewriter(phrases) {
        const el = document.getElementById('typewriter-text');
        if(!el) return;
        if(typeTimeout) clearTimeout(typeTimeout);
        
        let pIndex = 0, cIndex = 0, isDeleting = false;
        function type() {
            const current = phrases[pIndex];
            el.textContent = current.substring(0, isDeleting ? cIndex - 1 : cIndex + 1);
            cIndex += isDeleting ? -1 : 1;
            
            let speed = 100;
            if(isDeleting) speed = 50;
            
            if(!isDeleting && cIndex === current.length) { isDeleting = true; speed = 2000; }
            else if(isDeleting && cIndex === 0) { isDeleting = false; pIndex = (pIndex + 1) % phrases.length; speed = 500; }
            
            typeTimeout = setTimeout(type, speed);
        }
        type();
    }
    
    // Inicia com o Diagnóstico
    startTypewriter(toolDefinitions['Diagnostico'].typewriterExamples);
});