async function handleSubmit(e) {
  e.preventDefault();
  if (!isValid) return;

  const { error } = await supabase.from("toolbox_talks").insert([
    {
      site_name: siteName,
      date,
      supervisor,
      attendees: attendees.join(", "),
      discussion: discussionItems.join(" | "),
      actions: actionsRequired,
    },
  ]);

  if (error) {
    setMessage("Error saving data ❌");
  } else {
    setMessage("Saved to cloud successfully ✅");
    clearForm();
  }
}
