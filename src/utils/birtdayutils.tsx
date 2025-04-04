import { Member } from "app/hooks/dashboard-data.hook";

const filterBirthdayMembers = (members: Member[]): Member[] => {
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  return members.filter((member) => {
    if (!member.birthday || !member.active) return false;
    const [, month, day] = member.birthday.split("-").map(Number);
    return month === todayMonth && day === todayDay;
  });
};

export default filterBirthdayMembers;
