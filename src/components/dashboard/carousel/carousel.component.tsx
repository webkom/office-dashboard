import styles from "./carousel.module.css";
import filterBirthdayMembers from "../../../utils/birtdayutils";
import { Member } from "app/hooks/dashboard-data.hook";

const CarouselInfo = ({ members }: { members: Member[] }) => {
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

  return (
    <div className={`${styles.carousel}`}>
      <div className={`${styles.marquee}`}>
        <div className={`${styles["marquee-inner"]}`}>
          {[
            birthdayItems,
            ...birthdayItems,
            ...birthdayItems,
            ...birthdayItems,
          ]}
        </div>
      </div>
    </div>
  );
};

export default CarouselInfo;
