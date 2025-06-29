import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./FloatingNotes.css";

const FloatingNotes = () => {
  const [note, setNote] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);
  const popupRef = useRef(null);
  const iconRef = useRef(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) fetchNotes();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get("http://localhost:2100/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedNotes(res.data || []);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const saveNote = async () => {
    if (!token) {
      setError("You must be logged in to save notes.");
      return;
    }
    if (!note.trim()) return;

    try {
      await axios.post(
        "http://localhost:2100/api/notes",
        { content: note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNote("");
      setVisible(false);
      fetchNotes();
      setError("");
    } catch (err) {
      console.error("Error saving note:", err);
      setError("Failed to save note. Try logging in again.");
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:2100/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes();
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveNote();
    }
  };

  const startDrag = (e) => {
    dragging.current = true;
    dragOffset.current = {
      x: e.clientX - iconRef.current.getBoundingClientRect().left,
      y: e.clientY - iconRef.current.getBoundingClientRect().top,
    };
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const handleDrag = (e) => {
    if (!dragging.current) return;
    const x = e.clientX - dragOffset.current.x;
    const y = e.clientY - dragOffset.current.y;
    iconRef.current.style.left = `${x}px`;
    iconRef.current.style.top = `${y}px`;
  };

  const stopDrag = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDrag);
  };

  useEffect(() => {
    const header = popupRef.current?.querySelector(".popup-header");
    if (!header) return;

    let offsetX = 0, offsetY = 0, isDragging = false;

    const onMouseDown = (e) => {
      isDragging = true;
      offsetX = e.clientX - popupRef.current.getBoundingClientRect().left;
      offsetY = e.clientY - popupRef.current.getBoundingClientRect().top;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      popupRef.current.style.left = `${e.clientX - offsetX}px`;
      popupRef.current.style.top = `${e.clientY - offsetY}px`;
      popupRef.current.style.transform = "none";
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    header.addEventListener("mousedown", onMouseDown);
    return () => header.removeEventListener("mousedown", onMouseDown);
  }, [visible]);

  return (
    <>
      <div
        className="notes-icon"
        ref={iconRef}
        onMouseDown={startDrag}
        onClick={() => {
          if (!dragging.current) setVisible(!visible);
        }}
      >
        📝
      </div>

      {visible && (
        <div className="notes-popup" ref={popupRef}>
          <div className="popup-header">My Notes</div>
          {error && <div className="error">{error}</div>}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your note here..."
          />
          <button className="save-btn" onClick={saveNote}>Save & Close</button>
          <div className="notes-list">
            {savedNotes.length > 0 && (
              <ul>
                {savedNotes.map((n) => (
                  <li key={n._id}>
                    <span
                      onClick={() => setNote(n.content)}
                      style={{ cursor: "pointer", marginRight: "8px", display: "inline-block" }}
                    >
                      • {n.content}
                    </span>
                    <button
                      onClick={() => deleteNote(n._id)}
                      className="delete-btn"
                      title="Delete note"
                    >
                      DELETE
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingNotes;
