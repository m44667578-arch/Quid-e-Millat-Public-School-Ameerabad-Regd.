import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ChatMessage } from '../types';
import { decode, decodeAudioData } from '../utils/audio';

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState<number | null>(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const audioContextRef = useRef<AudioContext | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setMessages([{ role: 'model', text: 'Hello! How can I help you today?' }]);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userInput,
            });
            
            setMessages([...newMessages, { role: 'model', text: response.text }]);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setMessages([...newMessages, { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTTS = async (text: string, index: number) => {
        if (isSynthesizing !== null) return;
        setIsSynthesizing(index);

        try {
             if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const outputNode = audioContextRef.current.createGain();
            outputNode.connect(audioContextRef.current.destination);

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    audioContextRef.current,
                    24000,
                    1,
                );
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                source.start();
            }
        } catch (error) {
            console.error("Error generating speech:", error);
            alert("Sorry, I couldn't generate the audio for that message.");
        } finally {
            setIsSynthesizing(null);
        }
    };
    
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-school-blue text-white rounded-full p-4 shadow-lg hover:bg-opacity-90 transition-transform hover:scale-110"
                aria-label="Open Chatbot"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[calc(100%-48px)] sm:w-96 h-[70vh] sm:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-school-blue text-white rounded-t-2xl">
                <h3 className="font-bold text-lg">AI Assistant</h3>
                <button onClick={() => setIsOpen(false)} className="text-2xl leading-none">&times;</button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-school-gold flex-shrink-0" />}
                           <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                <p className="text-sm">{msg.text}</p>
                           </div>
                           {msg.role === 'model' && (
                                <button onClick={() => handleTTS(msg.text, index)} disabled={isSynthesizing !== null} className="text-gray-500 hover:text-school-blue disabled:opacity-50" aria-label="Read message aloud">
                                    {isSynthesizing === index ? (
                                        <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v1.333a1 1 0 01-2 0V4a1 1 0 011-1zm6.364 2.636a1 1 0 01-1.414 1.414L13.5 5.5a1 1 0 111.414-1.414l1.45 1.45zM18 10a1 1 0 01-1 1h-1.333a1 1 0 110-2H17a1 1 0 011 1zm-5.5 2.5a1 1 0 11-1.414 1.414l-1.45-1.45a1 1 0 111.414-1.414l1.45 1.45zM10 17a1 1 0 01-1-1v-1.333a1 1 0 112 0V16a1 1 0 01-1-1zM4.05 13.95a1 1 0 111.414-1.414l1.45 1.45a1 1 0 11-1.414 1.414l-1.45-1.45zM3 10a1 1 0 011-1h1.333a1 1 0 110 2H4a1 1 0 01-1-1zm2.5-5.5a1 1 0 111.414-1.414l1.45 1.45a1 1 0 01-1.414 1.414L5.5 5.5z" /></svg>
                                    )}
                                </button>
                           )}
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                           <div className="w-8 h-8 rounded-full bg-school-gold flex-shrink-0" />
                           <div className="max-w-[80%] p-3 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-75"></span>
                                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></span>
                                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></span>
                                </div>
                           </div>
                        </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-school-blue"
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-school-blue text-white rounded-full p-3 hover:bg-opacity-90 disabled:bg-gray-400" disabled={isLoading || !userInput.trim()}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                </form>
            </div>
             <style>{`.animate-fade-in { animation: fadeIn 0.3s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default Chatbot;
