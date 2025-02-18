import { useEffect, useState } from "react";
import { Member, OfficeTimes } from "app/hooks/dashboard-data.hook.ts";

const usePlayWelcomeMessage = (
  members: Member[] = [],
  officeTimes: OfficeTimes[] = [],
) => {
  const [previousOfficeTimes, setPreviousOfficetimes] =
    useState<OfficeTimes[]>(officeTimes);
  useEffect(() => {
    setPreviousOfficetimes(officeTimes);
  }, [officeTimes]);

  useEffect(() => {
    for (const member of members) {
      const officeTime = officeTimes.find(
        (ot) => ot.github_name === member.github,
      );
      const previousOfficeTime = previousOfficeTimes.find(
        (ot) => ot.github_name === member.github,
      );
      if (officeTime && previousOfficeTime) {
        if (officeTime?.is_active && !previousOfficeTime?.is_active) {
          const welcomeMessage =
            member.welcome_messages[
              Math.floor(Math.random() * member.welcome_messages.length)
            ];
          if (
            welcomeMessage.includes("http") ||
            welcomeMessage.includes("www")
          ) {
            const audio = new Audio(welcomeMessage);
            audio.play();
          } else {
            const msg = new SpeechSynthesisUtterance(welcomeMessage);
            msg.lang = "nb-NO";
            window.speechSynthesis.speak(msg);
          }
        }
      }
    }
  }, [members, officeTimes, previousOfficeTimes]);
};

export default usePlayWelcomeMessage;
