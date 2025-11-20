import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { useChatHistory } from './MainSection'; 
import './Workspace.css'; 

// Define the message interface
interface Message {
    id: number;
    sender: 'user' | 'bot';
    content: string;
}

// Props for the VaultAI component
interface VaultAIProps {
    initialChatId: string | null; // ID of the chat to load
    onNewChatIdCreated: (id: string) => void; // Callback when a new chat is successfully created
}

// Helper function to get the token (Adjust this based on your actual auth mechanism)
const getToken = () => localStorage.getItem('token'); 

const VaultAI: React.FC<VaultAIProps> = ({ initialChatId, onNewChatIdCreated }) => {
    // Default welcome messages
    const initialWelcomeMessages: Message[] = [
        { id: 1, sender: 'bot', content: "Hi there! I'm your AI helper. What would you like to do today?"},
        { id: 2, sender: 'bot', content: "**For example:**\n- `Summarize my DBMS notes (dbms.pdf)`\n- `Create MCQs from history-lecture.pdf`" },
    ];
    
    const [messages, setMessages] = useState<Message[]>(initialWelcomeMessages);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Start with no chat loaded so the effect will fetch when initialChatId is provided.
    const [currentChatIdState, setCurrentChatIdState] = useState<string | null>(null);     
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { addSession } = useChatHistory(); 

    // Scroll to the latest message whenever messages update
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Cleanup: save the local session history when the component unmounts (optional, as DB save is primary)
    useEffect(() => {
        return () => { 
            if (messages.length > initialWelcomeMessages.length) addSession({ id: Date.now(), messages }); 
        };
    }, [messages, addSession]);
    
    // ⭐️ FIX: Effect to load history based on initialChatId prop
    useEffect(() => {
        const token = getToken();
        
        // 1. If a chat ID is passed and it's valid, load it.
        if (initialChatId && token) {
            // Always fetch the chat when a (new) initialChatId is provided
            if (initialChatId !== currentChatIdState) {
                setCurrentChatIdState(initialChatId);
                setIsLoading(true);

               const loadChat = async () => {
                   try {
                       const res = await fetch(`http://127.0.0.1:5000/api/vaultai/chat/${initialChatId}`, {
                           headers: { "x-auth-token": token },
                       });
                       if (!res.ok) throw new Error("Failed to load chat history.");
                       const data = await res.json();
                       const loadedMessages: Message[] = data.messages.map((msg: any, index: number) => ({
                           id: index + 3,
                           sender: msg.role === 'user' ? 'user' : 'bot',
                           content: msg.message,
                       }));
                       setMessages(loadedMessages);
                   } catch (error) {
                       console.error("History loading error:", error);
                       setMessages([
                            { id: 1, sender: 'bot', content: "Error loading conversation. Please start a new chat."}
                        ]);
                    } finally {
                        setIsLoading(false);
                    }
                };
                loadChat();
            }
        }
        // 2. If the prop is null, reset the component to the "new chat" state
        else if (!initialChatId && currentChatIdState !== null) {
             setCurrentChatIdState(null);
             setMessages(initialWelcomeMessages);
        }
    }, [initialChatId]); // Only run when the initialChatId prop changes


    const handleSendMessage = async () => {
        const command = inputValue.trim();
        const token = getToken(); 

        if (!command || isLoading || !token) {
            if (!token) {
                 console.error("Authentication required. Please log in.");
            }
            return; 
        }

        // 1. Add User Message
        setMessages(prev => [
            ...prev,
            { id: Date.now(), sender: 'user', content: command }
        ]);
        setInputValue('');
        setIsLoading(true);

        try {
            let currentChatId = currentChatIdState;
            
            // 2. If no chatId exists, create a new chat session first
            if (!currentChatId) {
                const newChatRes = await fetch("http://127.0.0.1:5000/api/vaultai/new", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "x-auth-token": token 
                    },
                });
                
                const newChatData = await newChatRes.json();
                if (!newChatRes.ok) {
                    throw new Error(newChatData.error || "Failed to start a new chat session.");
                }
                
                currentChatId = newChatData.chatId;
                setCurrentChatIdState(currentChatId); 
                
                // Notify parent component that a new chat ID was created
                onNewChatIdCreated(currentChatId);
            }

            // 3. Send the message to the specific chat ID endpoint
            const res = await fetch(`http://127.0.0.1:5000/api/vaultai/${currentChatId}`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-auth-token": token 
                },
                body: JSON.stringify({ prompt: command })
            });

            const data = await res.json();
            
            if (!res.ok) {
                 throw new Error(data.error || "AI response failed.");
            }

            // 4. Add Bot Response
            let botText = data.response || "Sorry, backend gave no response.";
            setMessages(prev => [
                ...prev,
                { id: Date.now() + 1, sender: "bot", content: botText }
            ]);

        } catch (error) {
            console.error("AI Communication Error:", error);
            setMessages(prev => [
                ...prev,
                { id: Date.now() + 1, sender: "bot", content: `Error reaching MindVault: ${(error as Error).message}` }
            ]);
        }

        setIsLoading(false);
    };


    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="p-8 h-full flex flex-col vault-ai-bg">
            <h1 className="text-4xl font-bold mb-2 text-white text-center">VaultAI</h1>
            <p className="text-gray-400 mb-6 text-center">Use natural language to interact with your uploaded files.</p>

            {/* Adjusted styles for the chat box */}
            <div className="flex-1 p-4 rounded-2xl bg-white/10 border border-white/20 overflow-y-auto custom-scrollbar flex flex-col gap-4 mx-auto w-full max-w-[80%] max-h-[70%]">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        {/* Render markdown content */}
                        <div 
                            className={`break-words max-w-[70%] px-4 py-2 rounded-xl text-white ${msg.sender === "user" ? "bg-purple-600 rounded-tr-none" : "bg-gray-700 rounded-xl"} ${msg.id === 2 ? 'text-sm max-w-[60%]' : ''}`} 
                            dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }}
                        />
                    </div>
                ))}
                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-700 px-4 py-2 rounded-xl flex gap-1">
                            {[0, 150, 300].map((delay, index) => (
                                <span key={index} className="bg-white w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }}></span>
                            ))}
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            {/* End of adjusted styles */}

            <div className="mt-4 flex items-center gap-2 mx-auto w-full max-w-[80%]">
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    onKeyDown={handleKeyPress} 
                    placeholder="e.g., Summarize my DBMS notes (dbms.pdf)" 
                    className="flex-grow bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500" 
                    disabled={isLoading}
                />
                <button 
                    onClick={handleSendMessage} 
                    className="primary-btn h-[52px] w-[52px] flex items-center justify-center rounded-lg text-base font-semibold" 
                    disabled={isLoading}
                >
                    ➤
                </button>
            </div>
        </div>
    );
};

export default VaultAI;