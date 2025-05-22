import React, { useState, useEffect, useRef } from "react";

function ChatModal({ open, onClose, currentUserId, targetUserId, targetUserName }) {
  // 修改這裡：統一用雙方 ID 排序組成 chatKey，確保雙方讀取同一筆訊息
  const chatKey = `chat_${[currentUserId, targetUserId].sort().join('_')}`;
  // 未讀訊息 key 保持原樣，表示 currentUserId 的未讀訊息來自 targetUserId
  const unreadKey = `unread_${currentUserId}_${targetUserId}`;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      const saved = JSON.parse(localStorage.getItem(chatKey)) || [];
      setMessages(saved);
      // 進入聊天室時，將自己的未讀設為 false
      localStorage.setItem(unreadKey, "false");
    }
  }, [open, chatKey, unreadKey]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      from: currentUserId,
      to: targetUserId,
      text: input,
      time: new Date().toISOString(),
    };
    const newMessages = [...messages, newMsg];
    setMessages(newMessages);
    localStorage.setItem(chatKey, JSON.stringify(newMessages));
    // 對方的未讀設為 true
    localStorage.setItem(`unread_${targetUserId}_${currentUserId}`, "true");
    setInput("");
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div style={{
        background: "#fff", borderRadius: 8, padding: 20, width: 350, maxHeight: 500, display: "flex", flexDirection: "column"
      }}>
        <div style={{ marginBottom: 10, fontWeight: "bold" }}>
          與 {targetUserName} 聊天
          <button onClick={onClose} style={{ float: "right", border: "none", background: "none", fontSize: 18, cursor: "pointer" }}>✖️</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", border: "1px solid #eee", borderRadius: 4, marginBottom: 10, padding: 5 }}>
          {messages.length === 0 ? (
            <div style={{ color: "#888", textAlign: "center", marginTop: 30 }}>還沒有訊息，開始聊天吧！</div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: msg.from === currentUserId ? "right" : "left",
                  margin: "6px 0",
                  color: msg.from === currentUserId ? "#384aa5" : "#555"
                }}
              >
                <span style={{ background: "#f2f2f2", borderRadius: 6, padding: "4px 10px", display: "inline-block" }}>
                  {msg.text}
                </span>
                <div style={{ fontSize: 10, color: "#aaa" }}>
                  {new Date(msg.time).toLocaleString()}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ display: "flex" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ flex: 1, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
            onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
            placeholder="輸入訊息..."
          />
          <button onClick={sendMessage} style={{ marginLeft: 8, padding: "6px 12px", borderRadius: 4, background: "#384aa5", color: "#fff", border: "none" }}>
            送出
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatModal;


/*import React, { useState, useEffect, useRef } from "react";

function ChatModal({ open, onClose, currentUserId, targetUserId, targetUserName }) {
  const chatKey = `chat_${currentUserId}_${targetUserId}`;
  const unreadKey = `unread_${targetUserId}_${currentUserId}`;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      const saved = JSON.parse(localStorage.getItem(chatKey)) || [];
      setMessages(saved);
      // 進入聊天室時，將自己的未讀設為 false
      localStorage.setItem(`unread_${currentUserId}_${targetUserId}`, "false");
    }
  }, [open, chatKey, currentUserId, targetUserId]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      from: currentUserId,
      to: targetUserId,
      text: input,
      time: new Date().toISOString(),
    };
    const newMessages = [...messages, newMsg];
    setMessages(newMessages);
    localStorage.setItem(chatKey, JSON.stringify(newMessages));
    // 對方的未讀設為 true
    localStorage.setItem(unreadKey, "true");
    setInput("");
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div style={{
        background: "#fff", borderRadius: 8, padding: 20, width: 350, maxHeight: 500, display: "flex", flexDirection: "column"
      }}>
        <div style={{ marginBottom: 10, fontWeight: "bold" }}>
          與 {targetUserName} 聊天
          <button onClick={onClose} style={{ float: "right", border: "none", background: "none", fontSize: 18, cursor: "pointer" }}>✖️</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", border: "1px solid #eee", borderRadius: 4, marginBottom: 10, padding: 5 }}>
          {messages.length === 0 ? (
            <div style={{ color: "#888", textAlign: "center", marginTop: 30 }}>還沒有訊息，開始聊天吧！</div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: msg.from === currentUserId ? "right" : "left",
                  margin: "6px 0",
                  color: msg.from === currentUserId ? "#384aa5" : "#555"
                }}
              >
                <span style={{ background: "#f2f2f2", borderRadius: 6, padding: "4px 10px", display: "inline-block" }}>
                  {msg.text}
                </span>
                <div style={{ fontSize: 10, color: "#aaa" }}>
                  {new Date(msg.time).toLocaleString()}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ display: "flex" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ flex: 1, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
            onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
            placeholder="輸入訊息..."
          />
          <button onClick={sendMessage} style={{ marginLeft: 8, padding: "6px 12px", borderRadius: 4, background: "#384aa5", color: "#fff", border: "none" }}>
            送出
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatModal;*/
