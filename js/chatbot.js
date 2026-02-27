    
    const chatWindow = document.getElementById("chatWindow");
    const chatToggle = document.getElementById("chatToggle");
    const popupSound = document.getElementById("popupSound");
    
    // Appear after 3 seconds + play sound
    window.onload = function() {
        setTimeout(() => {
            openChat();
            popupSound.play();
        }, 3000);
    };
    
    chatToggle.addEventListener("click", function(event) {
        event.stopPropagation();
        if (chatWindow.style.display === "flex") {
            closeChat();
        } else {
            openChat();
        }
    });
    
    function openChat() {
        chatWindow.style.display = "flex";
        setTimeout(() => {
            chatWindow.style.opacity = "1";
            chatWindow.style.transform = "translateY(0)";
        }, 10);
    }
    
    function closeChat() {
        chatWindow.style.opacity = "0";
        chatWindow.style.transform = "translateY(30px)";
        setTimeout(() => {
            chatWindow.style.display = "none";
        }, 300);
    }
    
    // Close when clicking outside
    document.addEventListener("click", function(event) {
        if (!chatWindow.contains(event.target) &&
            !chatToggle.contains(event.target)) {
            closeChat();
        }
    });
    
    // ================= SEND MESSAGE =================
    function sendMessage() {
        const input = document.getElementById("chatInput");
        const message = input.value.trim();
        if (!message) return;
    
        const chatBody = document.getElementById("chatBody");
    
        chatBody.innerHTML += `<div class="message user-message">${message}</div>`;
    
        const replyText = "Thank you! Our mission is to make learning accessible for everyone.";
    
        chatBody.innerHTML += `<div class="message bot-message">${replyText}</div>`;
    
        speak(replyText);
    
        input.value = "";
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    // ================= VOICE INPUT =================
    function startChatVoice() {
    
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported. Please use Google Chrome.");
            return;
        }
    
        const recognition = new webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.start();
    
        recognition.onresult = function(event) {
            const speechText = event.results[0][0].transcript;
            document.getElementById("chatInput").value = speechText;
            sendMessage();
        };
    }
    
    // ================= VOICE OUTPUT FIXED =================
    window.speechSynthesis.onvoiceschanged = function() {
        window.speechSynthesis.getVoices();
    };
    
   
    