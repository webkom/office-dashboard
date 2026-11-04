import { useEffect, useRef } from "react";
import { Member, OfficeTimes } from "app/hooks/dashboard-data.hook.ts";

function playWelcome(member: Member) {
  const messages = member.welcome_messages ?? [];
  if (messages.length === 0) return;
  const message = messages[Math.floor(Math.random() * messages.length)];
  if (message.includes("http") || message.includes("www")) {
    void new Audio(message).play().catch(() => {});
  } else {
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "nb-NO";
    window.speechSynthesis.speak(speech);
  }
}

/** Plays a member's welcome message when they check in at the office */
const usePlayWelcomeMessageHook = (
  members: Member[] = [],
  officeTimes?: OfficeTimes[],
) => {
  // Compared with the check before, so each arrival plays once
  const lastRef = useRef<Map<string, boolean> | null>(null);

  useEffect(() => {
    if (!officeTimes?.length) return;
    const active = new Map(
      officeTimes.map((t) => [
        t.github_name.toLowerCase(),
        Boolean(t.is_active),
      ]),
    );
    const last = lastRef.current;
    lastRef.current = active;
    if (!last) return;

    for (const member of members) {
      const handle = member.github.toLowerCase();
      if (active.get(handle) && last.get(handle) === false) playWelcome(member);
    }
  }, [members, officeTimes]);
};

export default usePlayWelcomeMessageHook;
