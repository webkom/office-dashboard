import styles from "./carousel.module.css";
import filterBirthdayMembers from "../../../utils/birtdayutils";
import { Member } from "app/hooks/dashboard-data.hook";

const CarouselInfo = ({ members }: { members: Member[] }) => {
  const filteredByBirthday = filterBirthdayMembers(members);

  return (
    <div className={`${styles["carousel"]}`}>
      <div className={`${styles["marquee"]}`}>
        {filteredByBirthday.map((member) => (
          <div className={`${styles["text-birthday"]}`}>
            <h1>🎂🥳🎉</h1>
            <div className={`${styles["main-text-birthday"]}`}>
              <h1>Gratulerer med dagen {member.name}!!</h1>
            </div>
            <h1>🎉🥳🎂</h1>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselInfo;
