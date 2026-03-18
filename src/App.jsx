import { supabase } from "./supabase";
import React, { useMemo, useState } from "react";

export default function App() {
  const [siteName, setSiteName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [supervisor, setSupervisor] = useState("");
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [discussionInput, setDiscussionInput] = useState("");
  const [discussionItems, setDiscussionItems] = useState([]);
  const [actionsRequired, setActionsRequired] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [message, setMessage] = useState("");
const [photoFile, setPhotoFile] = useState(null);
  const isValid = useMemo(() => {
    return (
      siteName.trim() &&
      date &&
      supervisor.trim() &&
      attendees.length > 0 &&
      discussionItems.length > 0 &&
      reviewed
    );
  }, [siteName, date, supervisor, attendees, discussionItems, reviewed]);

  function addAttendee() {
    const cleaned = attendeeInput.trim();
    if (!cleaned) return;
    setAttendees((prev) => [...prev, cleaned]);
    setAttendeeInput("");
  }

  function removeAttendee(index) {
    setAttendees((prev) => prev.filter((_, i) => i !== index));
  }

  function addDiscussionItem() {
    const cleaned = discussionInput.trim();
    if (!cleaned) return;
    setDiscussionItems((prev) => [...prev, cleaned]);
    setDiscussionInput("");
  }

  function removeDiscussionItem(index) {
    setDiscussionItems((prev) => prev.filter((_, i) => i !== index));
  }

  function clearForm() {
    setSiteName("");
    setDate(new Date().toISOString().slice(0, 10));
    setSupervisor("");
    setAttendeeInput("");
    setAttendees([]);
    setDiscussionInput("");
    setDiscussionItems([]);
    setActionsRequired("");
    setReviewed(false);
    setMessage("");
  }
async function uploadPhoto(file) {
  if (!file) return "";

  const fileName = `${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("toolbox-photos")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("toolbox-photos")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
  async function sendEmailNotification(payload) {
  const response = await fetch(import.meta.env.VITE_NOTIFY_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Email notification failed");
  }
}
async function handleSubmit(e) {
  e.preventDefault();
  if (!isValid) return;

  try {
    const photoUrl = await uploadPhoto(photoFile);

    const { error } = await supabase.from("toolbox_talks").insert([
      {
        site_name: siteName,
        date,
        supervisor,
        attendees: attendees.join(", "),
        discussion: discussionItems.join(" | "),
        actions: actionsRequired,
        photo_url: photoUrl,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage("Error saving data ❌");
    } else {
  try {
    await sendEmailNotification({
      to: "robbie@udenbuilders.co.nz",
      site_name: siteName,
      date,
      supervisor,
      attendees,
      discussionItems,
      actionsRequired,
      photo_url: photoUrl,
    });
  } catch (e) {
    console.log("Email not set up yet");
  }

  clearForm();
  setPhotoFile(null);
  setMessage("Saved to cloud successfully ✅");
}
} catch (error) {
  console.error(error);
  setMessage(`Error uploading photo or saving data: ${error.message}`);
}
}

  const pageStyle = {
    minHeight: "100vh",
    background: "#f1f5f9",
    padding: "16px",
    fontFamily: "Arial, sans-serif",
    color: "#0f172a",
  };

  const cardStyle = {
    maxWidth: "480px",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
    padding: "20px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "16px",
    boxSizing: "border-box",
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: "100px",
    resize: "vertical",
  };

  const buttonStyle = {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    background: "#0f172a",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: "#e2e8f0",
    color: "#0f172a",
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ marginTop: 0, marginBottom: 6 }}>Uden Builders</h1>
        <p style={{ marginTop: 0, color: "#475569" }}>Toolbox Talk Register</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label>Site Name</label>
            <input
              style={inputStyle}
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Enter site name"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label>Date</label>
              <input
                type="date"
                style={inputStyle}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label>Supervisor</label>
              <input
                style={inputStyle}
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                placeholder="Supervisor name"
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label>Attendees</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={inputStyle}
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                placeholder="Add attendee name"
              />
              <button type="button" style={buttonStyle} onClick={addAttendee}>
                Add
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {attendees.map((name, index) => (
                <div
                  key={`${name}-${index}`}
                  style={{
                    background: "#e2e8f0",
                    borderRadius: "999px",
                    padding: "8px 12px",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <span>{name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttendee(index)}
                    style={{ border: "none", background: "transparent", cursor: "pointer" }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label>Items Discussed</label>
            <textarea
              style={textareaStyle}
              value={discussionInput}
              onChange={(e) => setDiscussionInput(e.target.value)}
              placeholder="Add one safety item or issue discussed"
            />
            <div style={{ marginTop: 8 }}>
              <button type="button" style={secondaryButtonStyle} onClick={addDiscussionItem}>
                Add Discussion Item
              </button>
            </div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {discussionItems.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "10px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <span>{index + 1}. {item}</span>
                  <button
                    type="button"
                    onClick={() => removeDiscussionItem(index)}
                    style={{ border: "none", background: "transparent", cursor: "pointer" }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label>Actions Required</label>
            <textarea
              style={textareaStyle}
              value={actionsRequired}
              onChange={(e) => setActionsRequired(e.target.value)}
              placeholder="Any follow-up actions, hazards, or responsibilities"
            />
          </div>
<div style={{ marginBottom: 14 }}>
  <label>Site Photo</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
    style={inputStyle}
  />
</div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={reviewed}
                onChange={(e) => setReviewed(e.target.checked)}
              />
              <span>Confirm this toolbox talk was reviewed with the site team</span>
            </label>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <button type="submit" style={buttonStyle} disabled={!isValid}>
              Save Toolbox Talk
            </button>
            <button type="button" style={secondaryButtonStyle} onClick={clearForm}>
              Clear Form
            </button>
          </div>
        </form>

        {message && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: "12px",
              background: "#ecfdf5",
              color: "#065f46",
              border: "1px solid #a7f3d0",
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
