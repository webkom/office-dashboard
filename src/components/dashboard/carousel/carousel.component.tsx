import styles from "./carousel.module.css";
import filterBirthdayMembers from "../../../utils/birtdayutils";
import { Member } from "app/hooks/dashboard-data.hook";

type CarouselInfoProps = {
  members: Member[];
};

const CarouselInfo = ({ members }: CarouselInfoProps) => {
  const filteredByBirthday = filterBirthdayMembers(members);

  const birthdayItems = filteredByBirthday.map((member) => (
    <div key={member.name} className={styles["text-birthday"]}>
      <h1>🥳</h1>
      <div className={styles["main-text-birthday"]}>
        <h1>Gratulerer med dagen {member.name}!!</h1>
      </div>
      <h1>🎉</h1>
    </div>
  ));

  // Hardcoded custom message
  // const customMessageItem = (
  //   <div className={styles["text-birthday"]}>
  //     <h1>🎉</h1>
  //     <div className={styles["main-text-birthday"]}>
  //       <h1>Velkommen til kontoret! Ha en fin dag 👋</h1>
  //     </div>
  //     <h1>✨</h1>
  //   </div>
  // );
  const hasBirthday = filteredByBirthday.length > 0;

  const content = hasBirthday
    ? [
        birthdayItems,
        ...birthdayItems,
        ...birthdayItems,
        ...birthdayItems,
        ...birthdayItems,
      ]
    : "";

  return (
    <div className={`${styles.carousel}`}>
      <div className={`${styles.marquee}`}>
        <div className={`${styles["marquee-inner"]}`}>{content}</div>
      </div>
    </div>
  );
};

export default CarouselInfo;
