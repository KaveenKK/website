import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SOCKET_URL = ""; // Set your backend Socket.IO URL if not same origin

export default function GroupChat({ houseId, user, houseName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef();
  const bottomRef = useRef();

  useEffect(() => {
    // Connect to socket
    socketRef.current = io(SOCKET_URL || window.location.origin);
    socketRef.current.emit("joinHouseRoom", houseId);
    // Fetch initial messages
    fetch(`/api/houses/${houseId}/chat?limit=50`)
      .then((res) => res.json())
      .then((msgs) => {
        setMessages(msgs);
        setLoading(false);
      })
      .catch(() => setError("Failed to load messages"));
    // Listen for new messages
    socketRef.current.on("houseMessage", (msg) => {
      if (msg.houseId === houseId) setMessages((m) => [...m, msg]);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, [houseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = {
      message: input,
      user: { username: user.username, avatar: user.avatar, discord_id: user.discord_id, _id: user._id },
      houseId,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, msg]);
    setInput("");
    socketRef.current.emit("houseMessage", msg);
    await fetch(`/api/houses/${houseId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("userToken")}` },
      body: JSON.stringify({ message: input }),
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[--color-bg]">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[--color-accent] bg-[--color-primary] text-[--color-btn-text]">
        <span className="font-bold text-lg">{houseName || "Group Chat"}</span>
      </header>
      <main className="flex-1 overflow-y-auto px-2 py-4 space-y-3">
        {loading && <div className="text-center text-[--color-accent]">Loading…</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {messages.map((msg, i) => (
          <div key={i} className="flex items-start gap-3">
            <img
              src={msg.user?.avatar ? `https://cdn.discordapp.com/avatars/${msg.user.discord_id || msg.user._id || ''}/${msg.user.avatar}.png` : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-[--color-accent] bg-white"
              onError={e => { e.target.onerror = null; e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"; }}
            />
            <div className="flex-1">
              <div className="font-semibold text-[--color-primary]">{msg.user?.username || "User"} <span className="text-xs text-gray-400 font-normal">{new Date(msg.createdAt).toLocaleString()}</span></div>
              <div className="text-[--color-text] text-base mt-1">{msg.message}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>
      <form onSubmit={sendMessage} className="flex gap-2 p-3 border-t border-[--color-accent] bg-white sticky bottom-0">
        <input
          className="flex-1 rounded-lg border border-[--color-accent] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[--color-primary] text-[--color-text] bg-[--color-bg]"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="bg-[--color-primary] text-[--color-btn-text] px-5 py-2 rounded-lg font-semibold hover:bg-[--color-secondary] transition">Send</button>
      </form>
    </div>
  );
} 