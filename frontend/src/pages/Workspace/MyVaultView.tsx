import React, { useState, useRef, useEffect, useCallback } from 'react';
import './MyVaultView.css';
import { useAuth } from '../../context/AuthContext';
// Import MyFile type and useTrash from MainSection
import { useTrash, type MyFile } from './MainSection'; 

// Icons
import {
  MoreVertical,
  Grid,
  List,
  File,
  FileText,
  FileBarChart,
  Check
} from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
  time?: string;
};

const FilePreviewModal: React.FC<{
  file: MyFile;
  onClose: () => void;
}> = ({ file, onClose }) => {
  return (
    <div className="file-preview-modal-overlay" onClick={onClose}>
      <div className="file-preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="file-preview-header">
          <h2>{file.name}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="file-preview-body">
          {file.previewUrl ? (
            <embed src={file.previewUrl} type={file.mime_type || 'application/pdf'} />
          ) : (
            <iframe
              src={`http://localhost:5000/api/vault/file/${file.id}/content`}
              title="File Preview"
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );
};

// Updated component signature to accept new props
interface MyVaultViewProps {
  restoredFile: MyFile | null;
  clearRestoredFile: () => void;
}

const MyVaultView: React.FC<MyVaultViewProps> = ({ restoredFile, clearRestoredFile }) => {
  const { token } = useAuth();
  // ✅ Access trash state from useTrash
  const { moveToTrash, trash } = useTrash(); 

  const [isGrid, setIsGrid] = useState(true);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isUploadDropdownOpen, setIsUploadDropdownOpen] = useState(false);

  const [selectedType, setSelectedType] = useState("Type");
  const [files, setFiles] = useState<MyFile[]>([]);
  const [openFileDropdown, setOpenFileDropdown] = useState<string | null>(null);

  const [activeFileChat, setActiveFileChat] = useState<MyFile | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [openedFileForPreview, setOpenedFileForPreview] = useState<MyFile | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  const filterDropdownRef = useRef<HTMLDivElement | null>(null);
  const uploadDropdownRef = useRef<HTMLDivElement | null>(null);
  const fileUploadInputRef = useRef<HTMLInputElement | null>(null);

  const chatInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      if (uploadDropdownRef.current && !uploadDropdownRef.current.contains(event.target as Node)) {
        setIsUploadDropdownOpen(false);
      }
      if (
        openFileDropdown &&
        !(event.target as HTMLElement).closest('.file-options-container') &&
        !(event.target as HTMLElement).closest('.file-options-container-details')
      ) {
        setOpenFileDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFileDropdown]);

  // EFFECT TO HANDLE FILE RESTORATION
  useEffect(() => {
    if (restoredFile) {
      setFiles(prev => {
        // Add file back to the list only if it's not already there
        if (!prev.some(f => f.id === restoredFile.id)) {
          return [restoredFile, ...prev];
        }
        return prev;
      });
      // Clear the state in the parent component
      clearRestoredFile();
    }
  }, [restoredFile, clearRestoredFile]);

  const fetchFiles = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    // This URL hits the backend API which now *excludes* permanently deleted files
    const url = `http://localhost:5000/api/vault/files?search=${encodeURIComponent(searchQuery)}`;

    try {
      const response = await fetch(url, {
        headers: { "x-auth-token": token }
      });

      if (response.ok) {
        let data: any[] = await response.json();

        // ✅ CRITICAL: Filter out files that are currently in the *frontend* trash state.
        // This handles the gap between moving to trash (frontend update) and the next full fetch.
        // Files permanently deleted on the backend will *not* be in `data` and *not* in `trash`.
        const trashFileIds = new Set(trash.map(f => f.id));
        const nonTrashData = data.filter(file => !trashFileIds.has(file.id));

        const filtered = selectedType === "Type"
          ? nonTrashData
          : nonTrashData.filter(file => file.type === selectedType);

        const mapped: MyFile[] = filtered.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          mime_type: f.mime_type,
          size: f.size,
          date: f.date,
          previewUrl: null
        }));

        setFiles(mapped);
      } else {
        setFiles([]);
      }

    } catch (error) {
      console.error(error);
      setFiles([]);
    }

    setIsLoading(false);

  // ✅ Dependency: Re-run fetch/filter when trash state changes (due to permanent deletion/restoration)
  }, [token, searchQuery, selectedType, trash]);

  useEffect(() => {
    fetchFiles();
  // ✅ Dependency: Re-run fetch/filter when trash state changes
  }, [fetchFiles, trash]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", selectedType !== "Type" ? selectedType : "Unknown");

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: { "x-auth-token": token },
        body: formData
      });

      if (response.ok) {
        fetchFiles();
      } else {
        console.error("Upload failed", response.statusText);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const triggerFileUpload = (type: string) => {
    setSelectedType(type);
    setIsUploadDropdownOpen(false);
    setTimeout(() => fileUploadInputRef.current?.click(), 0);
  };

  const handleFileSelection = (fileId: string) => {
    setSelectedFileIds(prev => {
      const newSet = new Set(prev);
      newSet.has(fileId) ? newSet.delete(fileId) : newSet.add(fileId);
      return newSet;
    });
  };

  // Handler to move a single file to trash
  const moveToTrashHandler = (file: MyFile) => {
    // 1. Send file object to TrashContext
    moveToTrash(file);
    // 2. Remove file from current files state (this is correct for optimistic update)
    setFiles(prev => prev.filter(f => f.id !== file.id));
    setOpenFileDropdown(null);
  };

  const handleBulkMoveToTrash = () => {
    if (selectedFileIds.size === 0) return;

    // Get the files to move
    const filesToMove = files.filter(f => selectedFileIds.has(f.id));

    // Move to trash one by one
    filesToMove.forEach(file => moveToTrash(file)); 

    // Filter out from MyVault files list
    setFiles(prev => prev.filter(f => !selectedFileIds.has(f.id)));

    setIsMultiSelectMode(false);
    setSelectedFileIds(new Set());
  };

  const getFileIcon = (file: MyFile) => {
    if (file.mime_type?.includes("pdf")) return <FileText />;
    if (file.mime_type?.includes("presentation")) return <FileBarChart />;
    return <File />;
  };

  /* PREVIEW using token (blob) */
  const openPreviewWithAuth = async (file: MyFile) => {
    if (!token) {
      alert("Not authenticated");
      return;
    }

    try {
      const resp = await fetch(`http://localhost:5000/api/vault/file/${file.id}/content`, {
        headers: { "x-auth-token": token }
      });

      if (!resp.ok) {
        console.error("Preview fetch failed", resp.status);
        alert("Preview unavailable");
        return;
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);

      setOpenedFileForPreview({ ...file, previewUrl: url });

    } catch (e) {
      console.error("Error fetching preview", e);
      alert("Preview failed");
    }
  };

  const closePreview = () => {
    if (openedFileForPreview?.previewUrl) {
      try { URL.revokeObjectURL(openedFileForPreview.previewUrl); } catch (e) { }
    }
    setOpenedFileForPreview(null);
  };

  /* Save chat to backend (upsert) - MODIFIED to accept messages to ensure latest state is saved */
  const saveChatToBackend = async (fileId: string, messagesToSave?: ChatMessage[]) => {
    if (!token) {
      console.error("Not authenticated. Cannot save chat.");
      return;
    }
    // Use messagesToSave if provided, otherwise use current state
    const messages = messagesToSave || chatMessages;

    try {
      const resp = await fetch(`http://localhost:5000/api/chat/${fileId}/save`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify({ messages: messages })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        console.error("Chat save failed", err);
      }
    } catch (e) {
      console.error("Save chat error", e);
    }
  };

  /* --- CHAT: load saved chat for file --- */
  const loadSavedChat = async (fileId: string) => {
    if (!token) return;
    try {
      setIsChatLoading(true);
      const resp = await fetch(`http://localhost:5000/api/chat/${fileId}`, {
        headers: { "x-auth-token": token }
      });
      if (!resp.ok) {
        setChatMessages([]);
      } else {
        const data = await resp.json();
        // data.messages expected array of {role, text, time}
        setChatMessages(data.messages || []);
      }
    } catch (e) {
      console.error("Load chat error", e);
      setChatMessages([]);
    } finally {
      setIsChatLoading(false);
    }
  };

  /* Open Smart Chat modal for a file: load saved chat and open modal */
  const openSmartChatForFile = async (file: MyFile) => {
    setActiveFileChat(file);
    await loadSavedChat(file.id);
    setTimeout(() => chatInputRef.current?.focus(), 200);
  };

  /* Send question to backend; backend uses saved chat as context */
  const askQuestion = async (fileId: string, questionText: string) => {
    if (!token) {
      alert("Not authenticated");
      return;
    }
    if (!questionText || questionText.trim().length === 0) return;

    const userMsg: ChatMessage = { role: 'user', text: questionText.trim(), time: new Date().toISOString() };
    // optimistic update user message
    setChatMessages(prev => [...prev, userMsg]);

    try {
      // call ask endpoint
      const resp = await fetch(`http://localhost:5000/api/chat/${fileId}/ask`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify({ question: questionText.trim() })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        console.error("Ask failed", err);
        setChatMessages(prev => {
            const newMessages = [...prev, { role: 'assistant', text: 'Sorry, I could not answer that right now.' }];
            saveChatToBackend(fileId, newMessages); // Save new state
            return newMessages;
        });
        return;
      }

      const data = await resp.json();
      const aiText = data.answer || data.text || "No answer.";
      const assistantMsg: ChatMessage = { role: 'assistant', text: aiText, time: new Date().toISOString() };

      setChatMessages(prev => {
          const newMessages = [...prev, assistantMsg];
          saveChatToBackend(fileId, newMessages); // Save new state
          return newMessages;
      });
    } catch (e) {
      console.error("Ask error", e);
      setChatMessages(prev => {
          const newMessages = [...prev, { role: 'assistant', text: 'Error contacting AI.' }];
          saveChatToBackend(fileId, newMessages); // Save new state
          return newMessages;
      });
    }
  };

  /* Quick actions: summarize */
  const runSummarize = async (fileId: string) => {
    if (!token) return;
    try {
      setIsChatLoading(true);
      
      const resp = await fetch(`http://localhost:5000/api/summarize/${fileId}`, { // Use existing summarize API
        headers: { "x-auth-token": token }
      });

      if (!resp.ok) {
        throw new Error("Summary generation failed.");
      }

      const data = await resp.json();
      const summaryText = data.summary || "Summary could not be generated.";
      
      const assistantMsg: ChatMessage = { 
          role: 'assistant', 
          text: `**Summary of the file:**\n\n${summaryText}`, 
          time: new Date().toISOString() 
      };

      setChatMessages(prev => {
          const newMessages = [...prev, assistantMsg];
          saveChatToBackend(fileId, newMessages); // Save new state
          return newMessages;
      });

    } catch (e) {
      console.error("Summarize error", e);
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Summary generation failed.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  /* Quick actions: generate mcqs (replaces runMCQs) */
  const runGenerateMcqs = async (fileId: string) => {
    if (!token) return;
    try {
      setIsChatLoading(true);
      // NOTE: API path remains /api/mcqs/ to match backend_app.py
      const resp = await fetch(`http://localhost:5000/api/mcqs/${fileId}`, {
        headers: { "x-auth-token": token }
      });
      
      if (!resp.ok) {
        throw new Error("MCQ generation failed.");
      }
      
      const data = await resp.json();
      const mcqs = data.mcqs || [];
      let mcqText = "I failed to generate MCQs.";

      if (mcqs.length > 0) {
        mcqText = "## Generated Multiple Choice Questions:\n\n";
        // Format the MCQs nicely
        mcqs.forEach((mcq: any, index: number) => {
          mcqText += `**${index + 1}. ${mcq.question}**\n`;
          mcq.options.forEach((option: string, i: number) => {
            const letter = String.fromCharCode(65 + i); // A, B, C, D
            mcqText += `- ${letter}. ${option}\n`;
          });
          // Assuming answer field exists in backend response
          if (mcq.answer) {
             mcqText += `*Correct Answer: ${mcq.answer}*\n\n`;
          } else {
             mcqText += '\n';
          }
        });
      }

      const assistantMsg: ChatMessage = { 
          role: 'assistant', 
          text: mcqText, 
          time: new Date().toISOString() 
      };
      
      setChatMessages(prev => {
          const newMessages = [...prev, assistantMsg];
          saveChatToBackend(fileId, newMessages); // Save new state
          return newMessages;
      });

    } catch (e) {
      console.error("MCQ generation error", e);
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'MCQ generation failed.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  /* handle Enter key on chat input */
  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activeFileChat) {
      const value = (e.target as HTMLInputElement).value;
      (e.target as HTMLInputElement).value = '';
      askQuestion(activeFileChat.id, value);
    }
  };

  /* File dropdown rendering */
  const renderFileDropdown = (file: MyFile) => {
    if (openFileDropdown !== file.id) return null;

    const dropdownElement = document.getElementById(`file-options-${file.id}`);
    const shouldFlipLeft =
      dropdownElement && dropdownElement.getBoundingClientRect().right > (window.innerWidth - 100);

    return (
      <ul className={`file-dropdown-menu ${shouldFlipLeft ? 'flip-left' : ''}`}>
        <li onClick={() => { setOpenFileDropdown(null); openPreviewWithAuth(file); }}>
          Open Preview
        </li>
        <li onClick={() => { setOpenFileDropdown(null); openSmartChatForFile(file); }}>
          Smart Chat
        </li>

        <hr className="file-divider" />

        {/* Download option removed as requested */}

        <li className="move-to-trash" onClick={() => moveToTrashHandler(file)}>
          Move to Trash
        </li>
      </ul>
    );
  };

  const renderGridFileItem = (file: MyFile) => (
    <div
      key={file.id}
      className={`file-item-grid ${selectedFileIds.has(file.id) ? "selected" : ""}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.file-options-container')) return;
        if (isMultiSelectMode) handleFileSelection(file.id);
        else openPreviewWithAuth(file);
      }}
    >
      <div className='file-item-content-center'>
        <div className="file-icon" style={{ fontSize: "3rem" }}>
          {getFileIcon(file)}
        </div>

        <p className="file-name">{file.name}</p>
      </div>

      <div
        className="file-options-container"
        id={`file-options-${file.id}`}
        onClick={(e) => {
          e.stopPropagation();
          if (isMultiSelectMode) return handleFileSelection(file.id);
          setOpenFileDropdown(openFileDropdown === file.id ? null : file.id);
        }}
      >
        {isMultiSelectMode ? (
          <div className="file-select-checkbox">
            {selectedFileIds.has(file.id) && <Check size={16} color="white" />}
          </div>
        ) : (
          <button className="file-options-btn" aria-label="options">
            <MoreVertical size={18} />
          </button>
        )}

        {!isMultiSelectMode && renderFileDropdown(file)}
      </div>
    </div>
  );

  const renderDetailFileItem = (file: MyFile) => (
    <div
      key={file.id}
      className={`file-item-details ${selectedFileIds.has(file.id) ? "selected" : ""}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.file-options-container-details')) return;
        if (isMultiSelectMode) handleFileSelection(file.id);
        else openPreviewWithAuth(file);
      }}
    >
      <div className="file-icon" style={{ fontSize: "1.5rem", color: "#a020f0", marginRight: '1rem' }}>
        {getFileIcon(file)}
      </div>

      <p className="file-name" style={{ flexBasis: '40%' }}>{file.name}</p>
      <span style={{ flexBasis: '15%', fontSize: '0.9rem', color: '#ccc' }}>{file.type || 'Other'}</span>
      <span style={{ flexBasis: '15%', fontSize: '0.9rem', color: '#ccc' }}>
        {(file.size !== undefined ? (file.size / (1024 * 1024)).toFixed(2) : 'N/A')} MB
      </span>
      <span style={{ flexBasis: '20%', fontSize: '0.9rem', color: '#aaa' }}>
        {file.date ? new Date(file.date).toLocaleDateString() : 'N/A'}
      </span>

      <div
        className="file-options-container-details"
        id={`file-options-details-${file.id}`}
        onClick={(e) => {
          e.stopPropagation();
          if (isMultiSelectMode) return handleFileSelection(file.id);
          setOpenFileDropdown(openFileDropdown === file.id ? null : file.id);
        }}
      >
        {isMultiSelectMode ? (
          <div className="file-select-checkbox">
            {selectedFileIds.has(file.id) && <Check size={16} color="white" />}
          </div>
        ) : (
          <button className="file-options-btn" aria-label="options">
            <MoreVertical size={18} />
          </button>
        )}

        {!isMultiSelectMode && renderFileDropdown(file)}
      </div>
    </div>
  );

  const renderFiles = () => {
    if (isLoading) {
      return <p style={{ textAlign: "center" }}>Loading files...</p>;
    }

    if (files.length === 0) {
      return (
        <div className="empty-vault-box">
          <div className="file-icons">
            <div className="file-icon-circle" style={{ backgroundColor: "#a020f0" }}>
              <FileText />
            </div>
            <div className="file-icon-circle">
              <FileBarChart />
            </div>
            <div className="file-icon-circle">
              <File />
            </div>
          </div>
          <h2>Your Vault is Empty</h2>
          <p>Upload a file or create new study materials to get started.</p>
        </div>
      );
    }

    return isGrid ? (
      <div className="files-grid-container">{files.map(renderGridFileItem)}</div>
    ) : (
      <div className="files-details-container">
        <div className="file-item-details" style={{ backgroundColor: '#444', fontWeight: 'bold', borderRadius: '8px' }}>
          <div style={{ flexBasis: '1.5rem', flexShrink: 0 }}></div>
          <p className="file-name" style={{ flexBasis: '40%' }}>Name</p>
          <span style={{ flexBasis: '15%' }}>Type</span>
          <span style={{ flexBasis: '15%' }}>Size</span>
          <span style={{ flexBasis: '20%' }}>Date Uploaded</span>
          <div style={{ width: '28px', flexShrink: 0, marginLeft: '1rem' }}></div>
        </div>
        {files.map(renderDetailFileItem)}
      </div>
    );
  };


  return (
    <div className="my-vault-container">
      {/* Smart Chat Modal (non-fullscreen modal overlay) */}
      {activeFileChat && (
        <div className="file-chat-modal-overlay" onClick={() => {
            // Save chat on closing the modal
            activeFileChat && saveChatToBackend(activeFileChat.id); 
            setActiveFileChat(null);
        }}>
          <div className="file-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="file-chat-header">
              <button 
                className="back-btn" 
                onClick={() => {
                  activeFileChat && saveChatToBackend(activeFileChat.id); // Save chat on back button click
                  setActiveFileChat(null);
                }}
              >
                ← Back
              </button>
              <span>Chat: {activeFileChat.name}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* Removed manual Save button as save is now automatic */}
              </div>
            </div>

            <div className="file-chat-body">
              {isChatLoading && <div className="chat-placeholder-message">Loading chat history or generating response...</div>}

              {!isChatLoading && chatMessages.length === 0 && (
                <div className="chat-placeholder-message">How can I help you study this file?</div>
              )}

              {!isChatLoading && chatMessages.map((m, idx) => (
                <div key={idx} className={`chat-bubble ${m.role === 'user' ? 'user' : 'assistant'}`}>
                  {m.text}
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-container">
              <button 
                className="quick-action-bubble" 
                onClick={() => activeFileChat && runSummarize(activeFileChat.id)}
                disabled={isChatLoading}
              >
                Summarize
              </button>
              <button 
                className="quick-action-bubble" 
                onClick={() => activeFileChat && runGenerateMcqs(activeFileChat.id)} // Renamed function
                disabled={isChatLoading}
              >
                Generate MCQs
              </button>
            </div>

            <div className="file-chat-input-container">
              <input
                ref={chatInputRef}
                className="file-chat-input"
                placeholder="Ask a question about the file..."
                onKeyDown={handleChatKeyDown}
              />
              <button
                className="file-chat-send-btn"
                onClick={() => {
                  const val = chatInputRef.current?.value || '';
                  if (activeFileChat && val.trim()) {
                    chatInputRef.current!.value = '';
                    askQuestion(activeFileChat.id, val);
                  }
                }}
                aria-label="send"
                title="Send"
                disabled={isChatLoading}
              >
                {/* Fixed: Replaced up arrow SVG with a paper plane icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-5-2Z"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {openedFileForPreview && (
        <FilePreviewModal file={openedFileForPreview} onClose={closePreview} />
      )}

      <div className="search-container">
        <input
          className="search-input"
          placeholder="Search your files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="panel-header">
        <h1 className="panel-header-title">Files</h1>

        <div className="panel-action-buttons">
          {isMultiSelectMode ? (
            <>
              <button
                className="select-multiple-btn delete-red"
                onClick={handleBulkMoveToTrash}
                disabled={selectedFileIds.size === 0}
              >
                Move {selectedFileIds.size || ""} to Trash
              </button>

              <button
                className="select-multiple-btn"
                onClick={() => {
                  setIsMultiSelectMode(false);
                  setSelectedFileIds(new Set());
                }}
              >
                Cancel Selection
              </button>
            </>
          ) : (
            <>
              <button
                className="select-multiple-btn"
                onClick={() => setIsMultiSelectMode(true)}
              >
                Select Multiple
              </button>

              <div className="dropdown-container" ref={uploadDropdownRef}>
                <button
                  className={`dropdown-button create-plus-btn ${isUploadDropdownOpen ? "active" : ""}`}
                  onClick={() => setIsUploadDropdownOpen(!isUploadDropdownOpen)}
                >
                  +
                </button>

                {isUploadDropdownOpen && (
                  <ul className="dropdown-menu" style={{ minWidth: 150, right: 0, left: 'auto', transform: 'translateX(-12px)' }}>
                    <li onClick={() => triggerFileUpload("PDF")}>Upload PDF</li>
                    <li onClick={() => triggerFileUpload("PPT")}>Upload PPT</li>
                    <li onClick={() => triggerFileUpload("TXT")}>Upload TXT</li>
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="filter-controls">
        <div className="dropdown-container" ref={filterDropdownRef}>
          <button
            className={`dropdown-button ${isFilterDropdownOpen ? "active" : ""}`}
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
          >
            {selectedType}
            <span className="dropdown-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </span>
          </button>

          {isFilterDropdownOpen && (
            <ul className="dropdown-menu" style={{ minWidth: 100, left: 0, right: 'auto' }}>
              <li onClick={() => { setSelectedType("Type"); setIsFilterDropdownOpen(false); }}>All</li>
              <li onClick={() => { setSelectedType("PDF"); setIsFilterDropdownOpen(false); }}>PDF</li>
              <li onClick={() => { setSelectedType("PPT"); setIsFilterDropdownOpen(false); }}>PPT</li>
              <li onClick={() => { setSelectedType("TXT"); setIsFilterDropdownOpen(false); }}>TXT</li>
            </ul>
          )}
        </div>

        <div className="view-buttons">
          <button className={isGrid ? "active" : ""} onClick={() => setIsGrid(true)}>
            <Grid size={24} />
          </button>
          <button className={!isGrid ? "active" : ""} onClick={() => setIsGrid(false)}>
            <List size={24} />
          </button>
        </div>
      </div>

      <input
        ref={fileUploadInputRef}
        type="file"
        accept=".pdf,.ppt,.pptx,.txt"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      <div className="file-content-wrapper">
        <div className="vault-bg-box">{renderFiles()}</div>
      </div>
    </div>
  );
};

export default MyVaultView;