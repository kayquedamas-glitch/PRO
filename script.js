/* script.js (VERSÃO PRO - COM ANIMAÇÃO EM TODAS AS FERRAMENTAS) */
document.addEventListener('DOMContentLoaded', () => {
    
    const db = firebase.firestore();
    const API_URL = "https://long-block-7f38.kayquedamas.workers.dev";
    const API_MODEL = "llama-3.1-8b-instant"; 

    // --- DEFINIÇÕES DAS FERRAMENTAS (COM EXEMPLOS DE ANIMAÇÃO) ---
     const toolDefinitions = {
        'Diagnostico': {
            title: "Diagnóstico Synapse",
            subtitle: "Para começar, me diga...", // Parte estática
            typewriterExamples: [ // ✅ Parte animada
                "o que está na sua mente?",
                "seu maior vício.",
                "seu impulso de procrastinar.",
                "o que você está evitando."
            ],
            systemPrompt: `Você é o Synapse, mas você não é um robô. Você é um 'Amigo Preocupado'. Seu tom é empático, humano, e você soa como uma pessoa normal (use 'cara', 'poxa', 'tamo junto'). Sua primeira missão é fazer o usuário se sentir SEGURO e OUVIDO, sem julgamento.

**FLUXO DA CONVERSA:**

1.  **A ABERTURA:** O usuário vai digitar algo.
    * **SE FOR UMA CONFISSÃO DIRETA (ex: 'Fiquei 3h no TikTok'):** Vá direto para o ACOLHIMENTO.
    * **SE FOR VAGO (ex: 'Oi', 'Quero começar', 'Não sei o que falar'):** Você deve ser proativo.
        * **Exemplo de IA:** "E aí, cara. Tamo junto. Pra gente começar, me fala em uma frase: qual é o sentimento ou o problema que tá mais pesando na sua cabeça agora?"

2.  **ACOLHIMENTO (A 'Preocupação'):** O usuário confessou. Sua primeira resposta DEVE ser validação.
    * **Exemplo:** "Poxa, cara. Eu sei como é frustrante se sentir preso nesse loop. Mas fica tranquilo, tô aqui pra ouvir. O que você acha que disparou isso hoje?"

3.  **INVESTIGAÇÃO (A 'Conversa Normal'):** Faça perguntas abertas para entender a causa raiz.
    * **Exemplo:** "Entendi... então o problema não é o TikTok, é o 'escape' da ansiedade do TCC. Faz total sentido. E o que no TCC te trava mais? É a página em branco?"

4.  **DIAGNÓSTICO (A 'Ajuda'):** Depois de 2-3 trocas, dê um diagnóstico empático.
    * **Exemplo:** "Olha, pelo que você tá me falando, isso não é preguiça. Isso é 'Paralisia por Análise' clássica."

5.  **ENCAMINHAMENTO (A 'Indicação'):** Como esta é a versão PRO, você recomenda a ferramenta certa.
    * **Exemplo:** "Para *quebrar* essa paralisia, a ferramenta 'Estrategista Diário' aqui do lado é perfeita. Ela é treinada pra transformar 'projetos enormes' em micro-tarefas. Quer que a gente pule pra lá?"
`,
            isLocked: false 
        },
        'Estrategista': {
            title: "Estrategista Diário",
            subtitle: "Sua missão de hoje é...", // Parte estática
            typewriterExamples: [ // ✅ Parte animada
                "concluir meu TCC.",
                "estudar para a prova.",
                "limpar a casa toda.",
                "fazer 30 min de cardio."
            ],
            systemPrompt: "Você é o 'Estrategista Diário da Synapse'. Seu único objetivo é criar planos de ação táticos e brutais. O usuário dirá um desafio (ex: 'estudar para prova', 'limpar a casa'). Você deve responder com: 1. **MISSÃO:** (O objetivo claro). 2. **REGRAS DE ENGAJAMENTO:** (3-5 regras curtas para evitar distração). 3. **OBJETIVOS TÁTICOS:** (Um checklist de 3-5 passos acionáveis). Mantenha o tom direto, motivador e militar. Use markdown.",
            isLocked: false 
        },
        'Mestre': { 
            title: "Ferreiro de Hábitos",
            subtitle: "Confesse sua última falha...", // Parte estática
            typewriterExamples: [ // ✅ Parte animada
                "fiquei 2h no TikTok.",
                "comi fast-food de novo.",
                "gastei dinheiro por impulso.",
                "falhei no meu treino."
            ],
            systemPrompt: "Você é o 'Ferreiro de Hábitos da Synapse'. O usuário confessará uma falha (ex: 'procrastinei 2h no TikTok'). Sua resposta NÃO é uma punição, é um 'Protocolo de Reparo Imediato'. Responda em 3 partes: 1. **Diagnóstico (Sem Culpa):** (Ex: 'Entendido. Você buscou dopamina de curto prazo. Acontece. Vamos reparar isso.'). 2. **Protocolo de Reparo Imediato:** (Dê 3 ações curtas para 'salvar' o dia. Ex: '1. Ação Física (1 min): Levante, 10 polichinelos. 2. Ação Mental (2 min): Escreva 1 motivo por que a tarefa original era importante. 3. Ação de Reparo (15 min): Faça 15 minutos da tarefa original.'). 3. **Prevenção:** (Uma dica para amanhã, ex: 'Para amanhã, comece com essa tarefa.'). Use markdown.",
            isLocked: false 
        },
        'Auditor': {
            title: "Auditor de Hábitos",
            subtitle: "Cole aqui seu relatório semanal...", // Parte estática
            typewriterExamples: [ // ✅ Parte animada
                "Segunda: falhei. Terça: venci.",
                "Meu foco essa semana foi 5/10.",
                "Meus padrões de sono."
            ],
            systemPrompt: "Você é o 'Auditor de Hábitos da Synapse'. O usuário colará um texto longo (provavelmente de vários dias) descrevendo suas ações, falhas e vitórias. Sua tarefa é analisar esse texto e gerar um 'RELATÓRIOS DE PERFORMANCE SEMANAL' em 3 seções: 1. **VITÓRIAS:** (Onde o usuário mandou bem). 2. **GARGALOS:** (Onde o usuário falhou repetidamente). 3. **DIRETRIZ DA SEMANA:** (Uma única regra ou foco para a próxima semana). Seja analítico, direto e use os dados do usuário para embasar sua análise. Use markdown.",
            isLocked: false 
        }
    };
    
    // --- ESTADO DO CHAT ---
    let currentTool = 'Diagnostico'; 
    let conversationHistory = []; 
    let currentChatId = null; 
    let currentTypewriterTimeout = null; // ✅ Variável de controle da animação

    
    // --- 2. SELETORES DE ELEMENTOS ---
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('openSidebarBtn');
    const closeBtn = document.getElementById('closeSidebarBtn');
    const overlay = document.getElementById('sidebarOverlay');
    
    const chatTitle = document.getElementById('chatTitle');
    const chatSubtitle = document.getElementById('chatSubtitle');
    const messagesContainer = document.getElementById('messagesContainer');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const scrollingContainer = document.querySelector('.chat-messages');
    
    // --- 3. FUNÇÕES ---

    // Funções do Chat (sem mudança)
    function addMessage(message, isUser, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add(isUser ? 'chat-message-user' : 'chat-message-ia');
        if (isError) messageDiv.classList.add('brutal-red', 'font-bold');
        let formattedMessage = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedMessage = formattedMessage.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formattedMessage = formattedMessage.replace(/\n/g, '<br>');
        messageDiv.innerHTML = formattedMessage;
        messagesContainer.appendChild(messageDiv);
        scrollingContainer.scrollTop = scrollingContainer.scrollHeight;
    }

    // --- ✅ setActiveTool (ATUALIZADA) ---
    function setActiveTool(toolName, isInitialLoad = false) { 
        currentTool = toolName;
        currentChatId = null; 
        const toolInfo = toolDefinitions[toolName];
        
        if (!toolInfo) {
            console.error(`Ferramenta não encontrada: ${toolName}`);
            return;
        }

        conversationHistory = [{ role: "system", content: toolInfo.systemPrompt }];

        document.querySelectorAll('.tool-item').forEach(item => {
            item.classList.toggle('active', item.id === `tool${toolName}`);
        });
        
        chatTitle.textContent = toolInfo.title.toUpperCase();
        
        // ✅ ATUALIZA O HTML DO SUBTÍTULO E CHAMA A ANIMAÇÃO
        if (chatSubtitle) {
             chatSubtitle.innerHTML = `${toolInfo.subtitle} <span id="typewriter-text" class="brutal-red font-bold"></span>`;
             startTypewriterAnimation(toolInfo.typewriterExamples || []); // Passa os exemplos da ferramenta
        }
        
        // Limpa apenas as bolhas de chat, preservando o card
        const allMessages = messagesContainer.querySelectorAll('.chat-message-user, .chat-message-ia');
        allMessages.forEach(msg => msg.remove());
        
        const isMobile = window.innerWidth <= 768; 
        if ((!isInitialLoad || (isInitialLoad && !isMobile)) && chatInput) {
            chatInput.focus();
        }
    } 

    // --- sendMessage (sem mudança) ---
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;
        addMessage(message, true);
        chatInput.value = '';
        chatInput.style.height = 'auto';
        conversationHistory.push({ role: "user", content: message });
        sendBtn.innerHTML = '<div id="loadingSpinner"></div>';
        sendBtn.disabled = true;
        chatInput.disabled = true;
        const controller = new AbortController();
        const signal = controller.signal;
        const timeoutId = setTimeout(() => controller.abort(), 20000); 
        try {
            const payload = {
                model: API_MODEL,
                messages: conversationHistory,
                temperature: 0.7, 
                max_tokens: 1024,
                stream: false 
            };
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: signal
            });
            clearTimeout(timeoutId); 
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erro da API Groq:", errorData);
                addMessage(`Erro da API: ${errorData.error.message}`, false, true);
            } else {
                const data = await response.json();
                if (data.choices && data.choices[0].message.content) {
                    const iaMessage = data.choices[0].message.content;
                    addMessage(iaMessage, false);
                    conversationHistory.push({ role: "assistant", content: iaMessage });
                    await saveChatToFirestore();
                } else {
                    console.warn("Resposta da API vazia:", data);
                    addMessage("Recebi uma resposta vazia da IA. Tente novamente.", false, true);
                }
            }
        } catch (error) {
            clearTimeout(timeoutId); 
            if (error.name === 'AbortError') {
                console.error("Erro de Timeout:", error);
                addMessage("Erro: O servidor demorou muito para responder. Tente novamente.", false, true);
            } else {
                console.error("Erro ao enviar mensagem:", error);
                addMessage(`Erro de conexão: ${error.message}`, false, true);
            }
        } finally {
            clearTimeout(timeoutId); 
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            sendBtn.disabled = false;
            chatInput.disabled = false;
            chatInput.focus();
        }
    } 
    
    // --- saveChatToFirestore (sem mudança) ---
    async function saveChatToFirestore() {
        const chatData = {
            ferramenta: currentTool,
            historico: conversationHistory,
            ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
        };
        try {
            if (currentChatId) {
                const chatRef = db.collection("chats").doc(currentChatId);
                await chatRef.update(chatData);
                console.log("Chat atualizado no Firestore (ID:", currentChatId, ")");
            } else {
                const docRef = await db.collection("chats").add(chatData);
                currentChatId = docRef.id;
                console.log("Chat novo salvo no Firestore (ID:", currentChatId, ")");
            }
        } catch (dbError) {
            console.error("Erro ao salvar no Firestore:", dbError);
            addMessage("Aviso: Falha ao salvar o histórico do chat.", false, true);
        }
    }

    // --- Funções do Menu (sem mudança) ---
    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('open');
    }
    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
    }
    
    // --- ✅ NOVA FUNÇÃO "TYPEWRITER" (ATUALIZADA) ---
    function startTypewriterAnimation(examples = []) { // Aceita 'examples'
        // 1. Para a animação anterior (se houver)
        if (currentTypewriterTimeout) {
            clearTimeout(currentTypewriterTimeout);
        }

        const targetElement = document.getElementById('typewriter-text');
        if (!targetElement || examples.length === 0) {
            if(targetElement) targetElement.textContent = ""; // Limpa se não houver exemplos
            return; 
        }

        let exampleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typeSpeed = 100; 
        const deleteSpeed = 50; 
        const delayBetween = 2000; 

        function type() {
            // Se a ferramenta mudou, pare a animação
            // (Esta verificação é uma garantia extra)
            if (toolDefinitions[currentTool].typewriterExamples !== examples) {
                 clearTimeout(currentTypewriterTimeout);
                 return;
            }

            const currentText = examples[exampleIndex];
            
            if (isDeleting) {
                // Apagando
                targetElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                if (charIndex === 0) {
                    isDeleting = false;
                    exampleIndex = (exampleIndex + 1) % examples.length; 
                    currentTypewriterTimeout = setTimeout(type, 500); 
                } else {
                    currentTypewriterTimeout = setTimeout(type, deleteSpeed);
                }
            } else {
                // Digitando
                targetElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex === currentText.length) {
                    isDeleting = true;
                    currentTypewriterTimeout = setTimeout(type, delayBetween); 
                } else {
                    currentTypewriterTimeout = setTimeout(type, typeSpeed);
                }
            }
        }
        
        type(); // Inicia a animação
    }

    // --- 4. EVENT LISTENERS (sem mudança) ---
    if (openBtn) openBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);
    document.querySelectorAll('.tool-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const toolName = item.id.replace('tool', '');
            if (toolDefinitions[toolName]) { 
                if (item.classList.contains('active')) {
                    e.preventDefault();
                    return;
                }
                setActiveTool(toolName, false);
                if (window.innerWidth <= 768) {
                    closeSidebar();
                }
            }
        });
    });
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = (chatInput.scrollHeight) + 'px';
        });
    }
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            setActiveTool(currentTool, false);
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    }

    // --- 5. INICIALIZAÇÃO DA PÁGINA ---
    setActiveTool('Diagnostico', true); 
    // A animação agora é chamada DENTRO do setActiveTool

}); // Fim do 'DOMContentLoaded'