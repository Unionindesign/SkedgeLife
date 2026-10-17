import React from "react";
import { useProfile } from "../data/ProfileProvider";
import ProfileStatus from "../components/ProfileStatus";
import ProfilePage from "../components/ProfilePage";

// The full page as visitors will see it, with the skin, logo, and website content.
export default function WebsitePreviewScreen() {
  const { state, reload } = useProfile();
  if (state.status === "error") return <ProfileStatus status="error" message={state.message} onRetry={reload} />;
  if (state.status !== "ready") return <ProfileStatus status={state.status} />;

  return (
    <ProfilePage
      profile={state.profile}
      variant="website"
      emptyHint="Nothing here yet. Add content from the Website tab and it shows up here."
    />
  );
}
